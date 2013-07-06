var ns = new (require('Nonsense'))();

var testData = {} 

testData.Conference = [
    { id: 'default' }
];

function fakeCaller(i) {
    return {
        id: '' + i,
        status: ns.name()
    };
};

testData.Caller = _(_.range(0, 10)).map(fakeCaller);

_.extend(this, {
    readModel: function readModel(model, id) {
        var dfr = new $.Deferred();

        if (!testData[model]) {
            dfr.reject(404);
        } else {
            var m = _(testData[model]).findWhere({id:id});
            m ? dfr.resolve(m) : dfr.reject(404);
        }

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
    debug("adding handler for readming models");
    Graft.reqres.setHandler('model:read', this.readModel);
    Graft.reqres.setHandler('collection:read', this.readCollection);
});

