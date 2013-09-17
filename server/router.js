// Implement a separate router object to handle the
// paths we will mount.
//
// We do this to work around the fact that express will
// register the app.router middleware the moment any route
// is mounted.
//
// this causes chaos in contrib modules that need to have
// their routers mounted in different orders.

var express  = require('express');
var _router = new express.Router();

_.defaults(this, _router);

Graft.Server.on('after:mount:static', function(opts) {
    Graft.Server.trigger('mount:router', opts);
});

Graft.Server.on('mount:router', function(opts) {
    Graft.Server.trigger('before:mount:router', opts);
    Graft.Server.use(this.middleware);
    Graft.Server.trigger('after:mount:router', opts);
}, this);
