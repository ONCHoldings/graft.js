/**
 * Main Server-side entry point for Graft.
 */
var _            = require('underscore');

// This is the shared code that actually create the
// initial Graft object for us.
Graft = global.Graft = require('./graft.shared');

// Hopefully this will be unecessary one day.
Graft.server = true;

// Bootstrap module system.
require('./lib/modules');

// Load the middleware extensions.
require('./middleware');

// Load up the primary Server middleware. (required)
require('./middleware/Server.graft.js');

// Load up the REST api middleware. (optional)
// 
// Provides /api/$modelName/$id routes for all
// registered model types, and CRUD.
require('./middleware/REST.graft.js');

// Load up the Client middleware (optional)
//
// Provides the functionality that bundles up the
// code base and distributes it to the client.
require('./middleware/Client.graft.js');


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

module.exports = App = Graft;
