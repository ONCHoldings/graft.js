// A quick test implementation to get something happening on the screen.
// a simple in-memory data adapter for tests.
var ns = new (require('Nonsense'))();

this.testData = {} 

this.findModel = function(model, id) {
    var dfr = new $.Deferred();

    if (!this.testData[model] || !id) {
        dfr.reject(405, 'no model or id');
    } else {
        var result = _(this.testData[model]).findWhere({id:id});
        result ? dfr.resolve(result) : dfr.reject(404);
    }

    return dfr.promise();
}

_.extend(this, {
    readModel: function readModel(model, id) {
        debug('readModel :', model, id);
        return this.findModel(model, id); 
    },
    updateModel: function readModel(model, id, data) {
        debug('updateModel :', model, id);
        var dfr = new $.Deferred();

        var data = _.clone(data);

        function updateModel(m) {
            _.extend(m, data);
            dfr.resolve(m);
        }
        this.findModel(model, id).then(updateModel, dfr.reject);

        return dfr.promise();
    },
    createModel: function(model, data) {
       debug('createModel :', model, data);
        var dfr = new $.Deferred();

        var data = _.clone(data);

        function modelExists(model) {
            dfr.reject(409, 'Conflict');
        }

        // we dont want the model to exist
        function createModel(err, reason) {
            _.extend(data, { id: ns.uuid() });
            this.testData[model].push(data);
            dfr.resolve(data);
        }

        this.findModel(model, data.id).then(modelExists, _.bind(createModel, this));

        return dfr.promise();
    },
    deleteModel: function(model, id) {
        var dfr = new $.Deferred();

        function deleteModel(m) {
            var ind = _(this.testData[model]).indexOf(m);
            this.testData[model].splice(ind, 1);

            dfr.resolve(204);
        }

        this.findModel(model, id).then(_.bind(deleteModel, this), dfr.reject);
        return dfr.promise();
    },
    readCollection: function readModel(col) {
        debug('read collection ' + col);
        var dfr = new $.Deferred();
        this.testData[col] ? dfr.resolve(this.testData[col]) : dfr.reject(404);
        return dfr.promise();
    }
});

this.addInitializer(function(opts) {
    debug("adding handler for reading models");
    Graft.reqres.setHandler('model:read', this.readModel, this);
    Graft.reqres.setHandler('model:update', this.updateModel, this);
    Graft.reqres.setHandler('model:create', this.createModel, this);
    Graft.reqres.setHandler('model:delete', this.deleteModel, this);
    Graft.reqres.setHandler('collection:read', this.readCollection, this);
});
