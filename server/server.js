var express  = require('express');
var http     = require('http');
var path     = require('path');

var _express = express();
this.express = _express;
this._server  = http.createServer(this.express);
_.defaults(this, _express);

require('../lib/sync');
/**
* Basic server setup
*/
this.addInitializer(function(opts) {
    var opts = opts || {};

    var locals = {
        nonce      : Date.now(),
        siteName   : 'graft example',
        title      : 'graft.js'
    };

    _.extend(this.locals, locals, opts.locals || {});

    debug('initialize server.graft');

    this.set('views', path.resolve(process.cwd() + '/templates'));
    this.set('view engine', 'jade');

    this.configure('production', _.bind(function() {
        this.enable('trust proxy');
    }, this));

    Graft.trigger('mount:server', opts);
    Graft.trigger('mount:static', opts);
});

Graft.on('mount:server', function(opts) {
    Graft.trigger('before:mount:server', opts);
    this.use(express.bodyParser());
    Graft.trigger('after:mount:server', opts);
}, this);

Graft.on('mount:static', function(opts) {
    Graft.trigger('before:mount:static', opts);
    this.use('/assets', express.static(process.cwd() + '/assets'));
    Graft.trigger('after:mount:static', opts);
}, this);

// Start the server
this.addInitializer(function serverStart(options) {
    var options = options || {};
    var port = options.port || 12400;
    Graft.Server.trigger('before:listen', this);
    this._server.listen(port);
    debug("Server started on port " + port);
    Graft.Server.trigger('listen', this);
});

this.addFinalizer(function() {
    debug('Shut down the socket');
    this._server.close();
});
