/**
 * Core application server, that mounts all the others.
*/
var express  = require('express');
var http     = require('http');
var path     = require('path');

var _express = express();
this.express = _express;
this.server  = http.createServer(this.express);
_.extend(this, _express);

require('../lib/sync');
/**
* Basic middleware setup
*/
this.addInitializer(function(opts) {
    var opts = opts || {};

    debug('initialize server.graft');
    this.locals.siteName = 'tropo test';
    this.locals.title    = 'tropo test';
    this.locals.secret   = 'good thing this is just a demo, right?';

    this.set('views', path.resolve(process.cwd() + '/templates'));
    this.set('view engine', 'jade');

    this.configure('production', _.bind(function() {
        this.enable('trust proxy');
    }, this));

    this.use(express.bodyParser());
    this.use(express.static(process.cwd() + '/assets'));
});

// Start the server
this.addInitializer(function serverStart(options) {
    var options = options || {};
    var port = options.port || 12400;

    this.server.listen(port);
    console.log("Server started on port " + port);
    Graft.Middleware.triggerMethod('listen', this);
});

this.addFinalizer(function() {
    debug('Shut down the socket');
    this.server.close();
});
