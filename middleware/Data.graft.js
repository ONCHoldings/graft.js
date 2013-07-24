/**
* Top level Data api module.
*/
var $ = require('jquery');

// Default data handlers for models.
//
// The custom Backbone.sync implementation on the
// server side will call these.
function notImplemented() {
    var dfr = new $.Deferred();
    dfr.reject(403, "Not Implemented");
    return dfr.promise();
}

Graft.commands.setHandler('data:setup', notImplemented);
Graft.reqres.setHandler('model:url', notImplemented);
Graft.reqres.setHandler('model:name', notImplemented);
Graft.reqres.setHandler('model:read', notImplemented);
Graft.reqres.setHandler('model:update', notImplemented);
Graft.reqres.setHandler('model:delete', notImplemented);
Graft.reqres.setHandler('model:create', notImplemented);
Graft.reqres.setHandler('collection:read', notImplemented);


// Mount all the rest api routes
this.addInitializer(function(opts) {
    debug('Initialize Core Data api');
    Graft.reqres.setHandler('model:name', this.modelName);
    Graft.reqres.setHandler('model:load', this.loadModel);
    Graft.reqres.setHandler('model:url', this.modelUrl);
});

// Implementations for each of the methods
_.extend(this, {
    modelName: function(model) {
        debug('model:name handler');
        var matches = matchUrl(model);
        return matches ? matches.name : false;
    },
    modelUrl: function(model) {
        return _.result(model, 'url');
    }
});

// Get the name and id from url.
//
// It uses a regex to match strings in the format
//     /api/$module/$id
//
// Returns false if not found.
function matchUrl(model) {
    var url = Graft.request('model:url', model) || false;
    debug('matchUrl: ' + url);

    var regex =  /\/api\/([^/]*)\/?([^/]*)\/?/;

    if (!url) { return false; }

    var matches = url.match(regex);

    if (!matches[1]) { return false; }

    var result = {};
    result.name = matches[1];
    matches[2] && (result.id = matches[2]);

    debug('matchUrl result:' , result);
    return result;
}

