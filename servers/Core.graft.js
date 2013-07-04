var express      = require('express');
var connect      = require('connect');
var cookie       = require('cookie');
var tropo_webapi = require('tropo-webapi');
var browserify   = require('browserify-middleware');
var jadeify2     = require('jadeify2');
var jade         = require('jade');
var path         = require('path');
var glob         = require('glob');
var http         = require('http');
var fs           = require('fs');
var _            = require('underscore');

/**
* Basic middleware setup
*/
this.addInitializer(function(opts) {
    this.locals.siteName = 'tropo test';
    this.locals.title = 'tropo test';
    this.locals.secret = 'good thing this is just a demo, right?';

    this.set('views', path.resolve(__dirname + '/../templates'));
    this.set('view engine', 'jade');

    this.configure('production', _.bind(function() {
        this.enable('trust proxy');
    }, this));

    this.use(express.bodyParser());
    this.use(express.static(__dirname + '/assets'));
    //this.use(express.logger());
    this.use(express.cookieParser());
    this.use(express.session({secret: 'secret', key: 'express.sid'}));
});

/**
 * Add the browserify stuff
 */
this.addInitializer(function browserifyConfig(options) {
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
    this.get('/js/shared.js', browserify(['../templates/index.js', '../shared.js'], {external: external}));
    external.push('./shared.js');

    // Finally, the initialization code.
    this.get('/js/client.js', browserify('../client.js', {external: external}));
});

// Start the server
this.addInitializer(function serverStart(options) {
    this.server.listen(12400);
});

