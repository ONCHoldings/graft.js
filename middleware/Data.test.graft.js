// A quick test implementation to get something happening on the screen.
//
var ns = new (require('Nonsense'))();

var testData = {} 

testData.Conference = [
    { id: 'default' },
    { id: 'room2' }
];

function fakeCaller(i) {
    return {
       id: '' + i,
       status: ns.name()
    };
};

function findModel(model, id) {
    var dfr = new $.Deferred();

    if (!testData[model] || !id) {
        dfr.reject(405, 'no model or id');
    } else {
        var result = _(testData[model]).findWhere({id:id});
        result ? dfr.resolve(result) : dfr.reject(404);
    }

    return dfr.promise();
}

testData.Caller = _(_.range(0, 5)).map(fakeCaller);

_.extend(this, {
    readModel: function readModel(model, id) {
        debug('readModel :', model, id);
        return findModel(model, id); 
    },
    updateModel: function readModel(model, id, data) {
        debug('updateModel :', model, id);
        var dfr = new $.Deferred();

        var data = _.clone(data);

        function updateModel(m) {
            _.extend(m, data);
            dfr.resolve(m);
        }
        findModel(model, id).then(updateModel, dfr.reject);

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
            testData[model].push(data);
            dfr.resolve(data);
        }

        findModel(model, data.id).then(modelExists, createModel);

        return dfr.promise();
    },
    deleteModel: function(model, id) {
        var dfr = new $.Deferred();

        function deleteModel(m) {
            var ind = _(testData[model]).indexOf(m);
            testData[model].splice(ind, 1);
            dfr.resolve(200);
        }

        findModel(model, id).then(deleteModel, dfr.reject);
        return dfr.promise();
    },
    readCollection: function readModel(col) {
        debug('read collection ' + col);
        var dfr = new $.Deferred();
        testData[col] ? dfr.resolve(testData[col]) : dfr.reject(404);
        return dfr.promise();
    }
});


this.addInitializer(function(opts) {
    debug("adding handler for reading models");
    Graft.reqres.setHandler('model:read', this.readModel);
    Graft.reqres.setHandler('model:update', this.updateModel);
    Graft.reqres.setHandler('model:create', this.createModel);
    Graft.reqres.setHandler('model:delete', this.deleteModel);
    Graft.reqres.setHandler('collection:read', this.readCollection);
});

