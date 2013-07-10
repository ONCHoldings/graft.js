/**
 * Main Server-side entry point for Graft.
 */
var _  = require('underscore');
var $ = require('jquery');


// Bootstrap module system.
var Graft = require('./lib/modules');
var Marionette = require('backbone.marionette');

// Hopefully this will be unecessary one day.
Graft.server = true;
global.__graftPath = __dirname + '/graft';

// Include the shared code for the client too.
Graft.bundle('shared', './lib/augment.js');
Graft.bundle('shared', './graft.js');

// Load up the primary Server middleware. (required)
require('./middleware/Server.graft.js');

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

// Default data handlers for models.
//
// The custom Backbone.sync implementation on the
// server side will call these.
function notImplemented() {
    var dfr = new $.Deferred();
    dfr.reject(403, "Not Implemented");
    return dfr.promise();
}

Graft.reqres.setHandler('model:name', notImplemented);
Graft.reqres.setHandler('model:read', notImplemented);
Graft.reqres.setHandler('model:update', notImplemented);
Graft.reqres.setHandler('model:delete', notImplemented);
Graft.reqres.setHandler('model:create', notImplemented);
Graft.reqres.setHandler('collection:read', notImplemented);

module.exports = Graft;
