var Backbone   = require('backbone');
var Marionette = require('backbone.marionette');
var _          = require('underscore');
var $          = require('jquery');

var augment = function(props) {
    var obj = this.prototype;
    for (var key in props) {
        if (typeof props[key] === 'function') {
            obj[key] = _.wrap(obj[key], props[key]);
        } else if (_.isArray(props[key])) {
            obj[key] = _.isArray(obj[key]) ? obj[key].concat(props[key]) : props[key];
        } else if (typeof props[key] === 'object') {
            obj[key] = _.extend({}, obj[key], props[key]);
        } else {
            obj[key] = props[key];
        }
    }

    return this;
};

Backbone.Model.augment    = Backbone.Collection.augment =
Backbone.Router.augment   = Backbone.View.augment       =
Marionette.View.augment   = Marionette.Region.augment   =
Marionette.Layout.augment = Marionette.ItemView.augment = augment;

// Extending the Backbone.Wreqr object with some functions we
// will need.

function aliasHandler(method) {
    return function aliasFn(src, target) {
        var args = _(arguments).toArray();
        var src = args.shift();
        args.unshift(this);
        args.unshift(this[method]);
        this.setHandler(src, _.bind.apply(_, args));
    };
}

Backbone.Wreqr.RequestResponse.prototype.aliasHandler = aliasHandler('request');
Backbone.Wreqr.Commands.prototype.aliasHandler = aliasHandler('execute');

// Frustratingly, the actual values that the options.success callback
// gets are available without wrapping all the fetch etc methods.
//
// Now we get to be far too clever with promises.

function wrapSync(sync) {
    return function(method, model, options) {
        var dfr = new $.Deferred();

        // this resolves it
        function onSync() {
            dfr.resolve.apply(dfr, _(arguments).toArray());
            model.off('error', onError); // clean up. we only want one or the other.
        }

        // this rejects it
        function onError() {
            dfr.reject.apply(dfr, _(arguments).toArray());
            model.off('sync', onSync); // clean up. we only want one or the other.
        }

        // Bind onto the sync and error events, to get the post-processed
        // variables. we only want to fire once.
        model.once('sync', onSync);
        model.once('error', onError);

        sync.apply(this, _(arguments).toArray());
        return dfr.promise();
    };
}

Backbone.sync = wrapSync(Backbone.sync);

module.exports = {
    augment: augment,
    wrapSync: wrapSync
};
