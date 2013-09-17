var express  = require('express');
var http     = require('http');
var path     = require('path');

var _express = express();
this.express = _express;
this._server  = http.createServer(this.express);
_.defaults(this, _express);

// Implement a separate router object to handle the
// paths we will mount.
//
// We do this to work around the fact that express will
// register the app.router middleware the moment any route
// is mounted.
//
// this causes chaos in contrib modules that need to have
// their routers mounted in different orders.
this.mainRouter = new express.Router();
console.log(this.mainRouter);

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
});

Graft.Server.on('mount:server', function(opts) {
    Graft.Server.trigger('before:mount:server', opts);
    this.express.use(express.bodyParser());
    Graft.Server.trigger('after:mount:server', opts);
}, this);

Graft.Server.on('mount:static', function(opts) {
    Graft.Server.trigger('before:mount:static', opts);
    this.express.use('/assets', express.static(process.cwd() + '/assets'));
    Graft.Server.trigger('after:mount:static', opts);
}, this);

Graft.Server.on('mount:router', function(opts) {
    Graft.Server.trigger('before:mount:router', opts);
    this.express.use(this.mainRouter.middleware);
    Graft.Server.trigger('after:mount:router', opts);
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

    Graft.Server.trigger('mount:server', options);
    Graft.Server.trigger('mount:static', options);
    Graft.Server.trigger('mount:router', options);

    this._server.listen(options.port);
    Graft.Server.trigger('after:listen', server, options);
}, this);

this.addFinalizer(function() {
    debug('Shut down the socket');
    this._server.close();
});
