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

    var locals = {
        siteName : 'graft example',
        title    : 'graft.js'
    };

    _.extend(this.locals, locals, opts.locals || {});

    debug('initialize server.graft');

    this.set('views', path.resolve(process.cwd() + '/templates'));
    this.set('view engine', 'jade');

    this.configure('production', _.bind(function() {
        this.enable('trust proxy');
    }, this));

    Graft.trigger('before:mount:middleware', opts);

    this.use(express.bodyParser());
    Graft.trigger('mount:middleware', opts);
    Graft.trigger('after:mount:middleware', opts);


    Graft.trigger('before:mount:static', opts);
    Graft.trigger('mount:static', opts);
    Graft.trigger('after:mount:static', opts);
});

Graft.on('mount:static', function(opts) {
    this.use(express.static(process.cwd() + '/assets'));
}, this);

// Start the server
this.addInitializer(function serverStart(options) {
    var options = options || {};
    var port = options.port || 12400;

    this.server.listen(port);
    debug("Server started on port " + port);
    Graft.Middleware.triggerMethod('listen', this);
});

this.addFinalizer(function() {
    debug('Shut down the socket');
    this.server.close();
});
