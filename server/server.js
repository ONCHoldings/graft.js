var express  = require('express');
var http     = require('http');
var path     = require('path');

var _express = express();
this.express = _express;

this._server  = http.createServer(this.express);
_.defaults(this, _express);

// noop - set router to strict mode
this.router;

require('../lib/sync');

/**
* Basic server setup
*/
this.addInitializer(function(options) {
    var options = options || {};

    var locals = {
        nonce      : Date.now(),
        siteName   : 'graft example',
        title      : 'graft.js'
    };

    _.extend(this.locals, locals, options.locals || {});

    debug('initialize server.graft');

    this.set('views', path.resolve(process.cwd() + '/templates'));
    this.set('view engine', 'jade');

    this.configure('production', _.bind(function() {
        this.enable('trust proxy');
    }, this));
});

Graft.Server.on('mount:server', function(options) {
    Graft.Server.trigger('before:mount:server', options);
    this.express.use(express.json());
    this.express.use(express.urlencoded());
    Graft.Server.trigger('after:mount:server', options);
}, this);

Graft.Server.on('mount:static', function(options) {
    Graft.Server.trigger('before:mount:static', options);
    this.express.use('/assets', express.static(process.cwd() + '/assets'));
    Graft.Server.trigger('after:mount:static', options);
}, this);

Graft.Server.on('mount:router', function(options) {
    Graft.Server.trigger('before:mount:router', options);
    Graft.Server.use(this.router);
    Graft.Server.trigger('after:mount:router', options);
}, this);

// Start the server
this.addInitializer(function serverStart(options) {
    var options = options || {};
    options.port = options.port || 12400;
    Graft.Server.trigger('listen', this, options);
    debug("Server started on port " + options.port);
});

Graft.Server.on('listen', function(server, options) {
    Graft.Server.trigger('before:listen', server, options);

    Graft.Server.trigger('mount:static', options);
    Graft.Server.trigger('mount:server', options);
    Graft.Server.trigger('mount:router', options);

    this._server.listen(options.port);
    Graft.Server.trigger('after:listen', server, options);
}, this);

this.addFinalizer(function() {
    debug('Shut down the socket');
    this._server.close();
});
