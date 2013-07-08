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
    debug('initialize server.graft');
    this.locals.siteName = 'tropo test';
    this.locals.title    = 'tropo test';
    this.locals.secret   = 'good thing this is just a demo, right?';

    this.set('views', path.resolve(__dirname + '/../templates'));
    this.set('view engine', 'jade');

    this.configure('production', _.bind(function() {
        this.enable('trust proxy');
    }, this));

    this.use(express.bodyParser());
    this.use(express.static(__dirname + '/../assets'));
    this.use(express.cookieParser());
    this.use(express.session({secret: 'secret', key: 'express.sid'}));
});

// Start the server
this.addInitializer(function serverStart(options) {
    this.server.listen(12400);
    Graft.Middleware.triggerMethod('listen', this);
});
