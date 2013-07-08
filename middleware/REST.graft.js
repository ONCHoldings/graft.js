var express  = require('express');
var http     = require('http');
var path     = require('path');

var _express = express();
this.express = _express;
this.server  = http.createServer(this.express);
_.extend(this, _express);


_.extend(this, {
    readModel: function(req, res, next) {
        var send = _.bind(res.send, res);
        var hasModelAndId = req.params.model && req.params.id;
        var modelExists = !!Graft.models[req.params.model];

        if (!hasModelAndId || !modelExists) { return next(404); }

        var model = new Graft.models[req.params.model]({
            id: req.params.id
        });


        debug('model');
        model.fetch().then(send, send);
    },
    updateModel: function(req, res, next) {
        var send = _.bind(res.send, res);
        Graft.request('model:update', req.params.model, req.params.id, req.body)
            .then(send, send);
    },
    createModel: function(req, res, next) {
        var send = _.bind(res.send, res);
        Graft.request('model:create', req.params.model, req.body)
            .then(send, send);
    },
    deleteModel: function(req, res, next) {
        var send = _.bind(res.send, res);
        Graft.request('model:delete', req.params.model, req.params.id)
            .then(send, send);
    },
    readCollection: function(req, res, next) {
        var send = _.bind(res.send, res);
        Graft.request('collection:read', req.params.collection)
            .then(send, send);
    },
    modelName: function(model) {
        debug('model:name handler');
        var matches = matchUrl(model);
        return matches ? matches.name : false;
    }
});

// Get the name and id from url.
//
// It uses a regex to match strings in the format
//     /api/$module/$id
//
// Returns false if not found.
function matchUrl(model) {
    var url = _.result(model, 'url') || false;
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

this.addInitializer(function(opts) {
    debug('Initialize REST api');
    this.post('/api/:model', this.createModel);
    this.get('/api/:model/:id', this.readModel);
    this.put('/api/:model/:id', this.updateModel);
    this.del('/api/:model/:id', this.deleteModel);
    this.get('/api/:collection', this.readCollection);
    Graft.reqres.setHandler('model:name', this.modelName);
    Graft.reqres.setHandler('model:load', this.loadModel);
});

Graft.Middleware.on('listen', function(Server) {
    debug('Mounting REST routes');
    Server.use(this);
}, this);
