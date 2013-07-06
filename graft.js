var _            = require('underscore');
var $ = global.$ = require('jquery');

Graft = global.Graft = require('./graft.shared');

// Hopefully this will be unecessary one day.
Graft.server = true;

require('./lib/modules');
require('./middleware');

require('./middleware/Server.graft.js');
require('./middleware/REST.graft.js');
require('./middleware/Data.test.graft.js');

var Server = Graft.Middleware.Server;

var expressMethods = ['all', 'get', 'post', 'delete', 'use', 'set', 'configure'];

_.each(expressMethods, function(method) {
    Graft[method] = function() {
        var args = Array.prototype.slice.call(arguments);
        return Server[method].apply(Server, args);
    };
}, this);

function notImplemented() {
    var dfr = new $.Deferred();
    dfr.reject(403, "Not Implemented");
    return dfr.promise();
}

// Default data handlers for models.
Graft.reqres.setHandler('model:read', notImplemented);
Graft.reqres.setHandler('model:update', notImplemented);
Graft.reqres.setHandler('model:delete', notImplemented);
Graft.reqres.setHandler('model:create', notImplemented);
Graft.reqres.setHandler('collection:read', notImplemented);

module.exports = App = Graft;
