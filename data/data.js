/**
* Top level Data api module.
*/

this.vent       = new Backbone.Wreqr.EventAggregator();
this.commands   = new Backbone.Wreqr.Commands();
this.reqres     = new Backbone.Wreqr.RequestResponse();

_.extend(this, {
    // Command execution, facilitated by Backbone.Wreqr.Commands
    execute: function(){
        var args = Array.prototype.slice.apply(arguments);
        this.commands.execute.apply(this.commands, args);
    },
    // Request/response, facilitated by Backbone.Wreqr.RequestResponse
    request: function(){
        var args = Array.prototype.slice.apply(arguments);
        return this.reqres.request.apply(this.reqres, args);
    }
});

// Default data handlers for models.
//
// The custom Backbone.sync implementation on the
// server side will call these.
function notImplemented() {
    var dfr = new _.Deferred();
    dfr.reject(403, "Not Implemented");
    return dfr.promise();
}

this.commands.setHandler('setup', notImplemented);
this.reqres.setHandler('url', notImplemented);
this.reqres.setHandler('name', notImplemented);
this.reqres.setHandler('read', notImplemented);
this.reqres.setHandler('update', notImplemented);
this.reqres.setHandler('delete', notImplemented);
this.reqres.setHandler('create', notImplemented);
this.reqres.setHandler('query', notImplemented);

function mapRequest(request) {
    return function(model){
        var args = _(arguments).toArray();
        var name = this.request('name', model);
        var evt = request + ':' + name;

        args.unshift(name);
        args.unshift(this.reqres.hasHandler(evt) || request);
        debug(args);

        return this.reqres.request.apply(this.reqres, args);
    };
}


_.extend(this, {
    read: mapRequest('read'),
    create: mapRequest('create'),
    update: mapRequest('update'),
    'delete': mapRequest('delete'),
    query: mapRequest('query')
});



// Mount all the rest api routes
this.addInitializer(function(opts) {
    debug('Initialize Core Data api');
    this.reqres.setHandler('name', modelName);
    this.reqres.setHandler('url', modelUrl);
});

// Implementations for each of the methods
function modelName(model) {
    var matches = matchUrl(model);
    return matches ? matches.name : false;
}

function modelUrl(model) {
    return _.result(model, 'url');
}

// Get the name and id from url.
//
// It uses a regex to match strings in the format
//     /api/$module/$id
//
// Returns false if not found.
function matchUrl(model) {
    var url = Graft.Data.request('url', model) || false;
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

