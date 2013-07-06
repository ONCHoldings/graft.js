
_.extend(this, {
    readModel: function(req, res, next) {
        var send = _.bind(res.send, res);
        Graft.request('model:read', req.params.model, req.params.id)
            .then(send, send);
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
        Graft.request('model:read', req.params.model)
            .then(send, send);
    },
});

this.addInitializer(function(opts) {
    debug('Initialize REST api');
    this.post('/api/:model', this.createModel);
    this.get('/api/:model/:id', this.readModel);
    this.put('/api/:model/:id', this.updateModel);
    this.del('/api/:model/:id', this.deleteModel);
    this.get('/api/:collection', this.readCollection);
});

Graft.Middleware.on('listen', function(Server) {
    debug('Mounting REST routes');
    Server.use(this);
}, this);
