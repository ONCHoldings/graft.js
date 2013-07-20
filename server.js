/**
 * Main Server-side entry point for Graft.
 */
var _              = require('underscore');
var $              = require('jquery');
var Marionette     = require('backbone.marionette');
var Graft          = require('./lib/modules'); // Bootstrap module system.
Graft.server       = true; // Hopefully this will be unecessary one day.
global.__graftPath = __dirname + '/graft.js';

// Load up the primary Server middleware. (required)
require('./middleware/Server.graft.js');

// Include the shared code for the client too.
Graft.bundle('shared', 'graftjs', global.__graftPath);
Graft.bundle('shared', './lib/mixins.js', __dirname);
Graft.bundle('shared', './lib/augment.js', __dirname);

Graft.bundle('vendor', 'jquery', 'jquery-browserify');
Graft.bundle('vendor', 'debug');
Graft.bundle('vendor', 'async');
Graft.bundle('vendor', 'underscore');
Graft.bundle('vendor', 'underscore.string');
Graft.bundle('vendor', 'backbone');
Graft.bundle('vendor', 'backbone.marionette');
Graft.bundle('vendor', 'backbone.wreqr');
Graft.bundle('vendor', 'backbone.babysitter');

// Bind the Server middleware's express route handlers to the
// Application Object.
//
// This allows you to just use Graft.VERB(path, fn) to register
// routes on the system.
//
// We can't just _.extend this, because the start methods
// on our already extended modules will conflict.
var Server = Graft.Middleware.Server;
var expressMethods = ['all', 'get', 'post', 'delete', 'use', 'set', 'configure'];

_.each(expressMethods, function(method) {
    Graft[method] = function() {
        var args = Array.prototype.slice.call(arguments);
        return Server[method].apply(Server, args);
    };
}, this);


// Stop this module by running its finalizers and then stop all of
// the sub-modules for this application
Graft.stop = function(){
    Marionette.triggerMethod.call(this, "before:stop");

    // stop the sub-modules; depth-first, to make sure the
    // sub-modules are stopped / finalized before parents
    _.each(this.submodules, function(mod){ mod.stop(); });
    this._initCallbacks.reset();

    Marionette.triggerMethod.call(this, "stop");
};

Graft.reset = function() {
    this.$models = {};
    this.$views = {};
    this.$routers = {};
    this.$middleware = {};

    this.resetBundles();
};

// Default data handlers for models.
//
// The custom Backbone.sync implementation on the
// server side will call these.
function notImplemented() {
    var dfr = new $.Deferred();
    dfr.reject(403, "Not Implemented");
    return dfr.promise();
}

Graft.reqres.setHandler('model:url', notImplemented);
Graft.reqres.setHandler('model:name', notImplemented);
Graft.reqres.setHandler('model:read', notImplemented);
Graft.reqres.setHandler('model:update', notImplemented);
Graft.reqres.setHandler('model:delete', notImplemented);
Graft.reqres.setHandler('model:create', notImplemented);
Graft.reqres.setHandler('collection:read', notImplemented);

module.exports = Graft;
