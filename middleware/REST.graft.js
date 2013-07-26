var express  = require('express');
var http     = require('http');

// This middleware needs to mount routes, so
// it extends the express object.

var _express = express();
this.express = _express;
this.server  = http.createServer(this.express);
_.extend(this, _express);


// Mount all the rest api routes
this.addInitializer(function(opts) {
    debug('Initialize REST api');
    this.post('/api/:model', this.createModel);
    this.get('/api/:model/:id', this.readModel);
    this.put('/api/:model/:id', this.updateModel);
    this.patch('/api/:model/:id', this.updateModel);
    this.del('/api/:model/:id', this.deleteModel);
    this.get('/api/:collection', this.readCollection);
});

Graft.Middleware.on('listen', function(Server) {
    debug('Mounting REST routes');
    Server.use(this);
}, this);

// Implementations for each of the methods
_.extend(this, {
    readModel: function(req, res, next) {
        var send = _.bind(res.send, res);
        var hasModelAndId = req.params.model && req.params.id;
        var modelExists = !!Graft.$models[req.params.model];

        if (!hasModelAndId || !modelExists) { return next(404); }

        var model = new Graft.$models[req.params.model]({
            id: req.params.id
        });

        function fetchModel(attrs) {
            debug('fetching model', req.params.model, req.params.id);
            send(model.toJSON()); // it only gets the attributes;
        }
        function failedModel(model, resp, options) {
            send(resp);
        }
        model.fetch().then(fetchModel, failedModel);
    },
    updateModel: function(req, res, next) {
        var send          = _.bind(res.send, res);
        var hasModelAndId = req.params.model && req.params.id;
        var modelExists   = !!Graft.$models[req.params.model];
        var options       = req.body;

        if (!hasModelAndId || !modelExists) { return next(404); }

        var model = new Graft.$models[req.params.model]({
            id: req.params.id
        });

        function saved(attrs) {
            send(201, model.toJSON());
        }
        function saveModel(attrs) {
            debug('saving model', req.params.model, model.id);
            model.save(options).then(saved, send);
        }

        model.fetch().then(saveModel, send);
    },
    createModel: function(req, res, next) {
        var hasBody     = req.body;
        var hasModel    = req.params.model;
        var modelExists = !!Graft.$models[req.params.model];

        if (!hasBody || !hasModel || !modelExists) {
            return next(403, 'Forbidden');
        }

        var send  = _.bind(res.send, res);
        var model = new Graft.$models[req.params.model](req.body);
        if (model.id !== undefined) {
            delete model.id;
        }

        function created(attrs) {
            res.set('Location', Graft.request('model:url', model));
            res.send(303, model.toJSON());
        }
        function createModel(attrs) {
            debug('creating model', req.params.model);
            model.save(req.body).then(created, send);
        }

        model.fetch().then(createModel, createModel);
    },
    deleteModel: function(req, res, next) {
        var send             = _.bind(res.send, res);
        var hasModelAndId = req.params.model && req.params.id;
        var modelExists   = !!Graft.$models[req.params.model];

        if (!hasModelAndId || !modelExists) { return next(405); }

        var model = new Graft.$models[req.params.model]({
            id: req.params.id
        });

        function deleted(attrs) {
            send(204);
        }

        function deleteModel(attrs) {
            debug('deleting model', req.params.model, req.params.id);
            model.destroy().then(deleted, send);
        }
        model.fetch().then(deleteModel, send);
    },
    readCollection: function(req, res, next) {
        var send             = _.bind(res.send, res);
        var cName            = _.pluralize(req.params.collection);
        var collectionExists = !!Graft.$models[cName];

        if (!collectionExists) {
            return res.send(403, 'Collection does not exist');
        }

        var collection   = new Graft.$models[cName]();
        var isCollection = collection instanceof Backbone.Collection;

        if (!isCollection) {
            return res.send(403, 'Not a collection');
        }

        // TODO: pass through options?
        function readCollection(attrs) {
            debug('read collection', cName);
            res.send(collection.toJSON());
        }
        collection.fetch().then(readCollection, send);
    }
});
