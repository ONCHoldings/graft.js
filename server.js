var express      = require('express');
var connect      = require('connect');
var cookie       = require('cookie');
var tropo_webapi = require('tropo-webapi');
var browserify   = require('browserify-middleware');
var jadeify2     = require('jadeify2');
var jade         = require('jade');
var glob         = require('glob');
var http         = require('http');
var fs           = require('fs');
var _            = require('underscore');


var $ = global.$ = require('jquery');
var App = require('./shared');
Graft = global.Graft = App;

require('./server/modules.js');

// This is now an express App/Marionette app hybrid.
var app = express();
_.extend(App, app);
App.express = app;

/**
 * Basic middleware setup
 */
App.locals.siteName = 'tropo test';
App.locals.title = 'tropo test';
App.locals.secret = 'good thing App is just a demo, right?';

App.set('views', __dirname + '/templates');
App.set('view engine', 'jade');

App.configure('production', function() {
    App.enable('trust proxy');
});

App.use(express.bodyParser());
App.use(express.static(__dirname + '/assets'));
//App.use(express.logger());
App.use(express.cookieParser());
App.use(express.session({secret: 'secret', key: 'express.sid'}));

App.server  = http.createServer(App.express);


/**
 * Add the browserify stuff
 */
App.addInitializer(function browserifyConfig(options) {
    // Import templates
    var templates = glob.sync('./templates/*.jade');
    var transFn = _.wrap(jadeify2, function(fn, file, options) {
        // dirty kludge to fix the part issue in the jadeify2 transform
        return fn(file, { client: true, filename: file, compileDebug: false });
    });
    this.get('/js/templates.js', browserify(templates, {transform: transFn}));
    var external = _.clone(templates);

    // Import vendor stuff
    var vendor = [
        'jquery-browserify', 'underscore',
        'underscore.string', './shared/underscore.js',
        'backbone', 'backbone.marionette',
        'jqueryui-browser/ui/jquery-ui.js',
        './assets/js/jquery.phono.js'
    ];
    this.get('/js/vendor.js', browserify(vendor, {ignore: ['jquery-browser']}));
    external = external.concat(vendor);

    // Do the other types.
    var files = ['resources', 'models', 'views', 'routers'];
    var processFn = function(memo, file) {
        var files = glob.sync('./' + file +'/*.js*'); // ugh. hack
        this.get('/js/' + file +'.js', browserify(files, {external: memo}));
        memo = memo.concat(files);
        return memo;
    };
    external = _.reduce(files, processFn, external, this);

    // Handle shared code between server and client.
    this.get('/js/shared.js', browserify(['./templates/index.js', './shared.js'], {external: external}));
    external.push('./shared.js');

    // Finally, the initialization code.
    this.get('/js/client.js', browserify('./client.js', {external: external}));
});

// Start the server
App.addInitializer(function serverStart(options) {
    this.server.listen(12400);
});

// Initialize the sockets
App.addInitializer(function socketConfig(options) {
    var io = this.io = require('socket.io').listen(this.server);

    io.configure(function() {
        io.enable("browser client minification");
        io.enable("browser client etag");
        io.enable("browser client gzip");
        io.set("destroy upgrade", false);
        io.set("log level", 1);
        io.set("transports", ["websocket", "htmlfile", "xhr-polling", "jsonp-polling"]);
    });

    io.set('authorization', function socketAuth(handshakeData, accept) {
        if (handshakeData.headers.cookie) {
            handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
            handshakeData.sessionID = connect.utils.parseSignedCookie(
                handshakeData.cookie['express.sid'], 'secret'
            );

            if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
                console.log('cookie is invalid');
                return accept('Cookie is invalid.', false);
            }
        } else {
                console.log('no cookie transmitted');
            return accept('No cookie transmitted.', false);
        } 
        accept(null, true);
    });
});


module.exports = App;
