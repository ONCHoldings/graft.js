/**
* Server-side replacement for Backbone.sync.
*
* Abstracts the logic of how to handle the various modules
 */
// TODO: We are just assuming the Graft object is global for now.
var Backbone = require('backbone');
var $ = require('jquery');
var _        = require('underscore');
var debug    = require('debug')('graft:backbone.sync');

Backbone.sync = function(method, model, options) {
    var dfr = new $.Deferred();


    var modelName = Graft.request('model:name', model); // sync call.
    debug('Backbone.sync:', method, modelName, model.id);

    // call the original handlers
    options.success && dfr.done(options.success);
    options.error && dfr.fail(options.error);

    dfr.fail(_.partial(debug, 'Sync Failed: '));

    var params = { data: {} };

    if (!options.url) {
        params.url = _.result(model, 'url') || dfr.reject(401, 'Resource not configured');
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
        params.data = options.attrs || model.toJSON(options);
    }

    _.extend(params, options);

    var methods = ['create', 'read', 'update', 'patch', 'delete'];
    var isValidMethod = _.include(methods, method);
    var isCollectionRead = model instanceof Backbone.Collection && (method == 'read');
    var isCreateMethod = (method == 'create');
    var hasModelId = !!model.id;
    var isValidIdMethod = params.data.id && !isCreateMethod;

    if (!isValidMethod) {
        dfr.reject(405, 'Method Not Allowed');
    } else if (isCollectionRead) {
        Graft.request('collection:read', modelName)
            .then(dfr.resolve, dfr.reject);
    } else if (isValidIdMethod) {
        Graft.request('model:' + method, modelName, params.data.id, params.data)
            .then(dfr.resolve, dfr.reject);
    } else if (isCreateMethod) {
        Graft.request('model:' + method, modelName, params.data)
            .then(dfr.resolve, dfr.reject);
    } else if (hasModelId) {
        Graft.request('model:' + method, modelName, model.id)
            .then(dfr.resolve, dfr.reject);
    } else {
        dfr.reject(405, 'Method Not Allowed');
    }

    var xhr = dfr.promise();

    // trigger a request event if we actually passed the call
    // to the data adapter layer.
    if (!dfr.isRejected()) {
        model.trigger('request', model, xhr, options);
    }

    return xhr;
};
