var _ = require('./lib/mixins.js');

var Backbone = require('backbone');
Backbone.$ = $;

var Marionette = require('backbone.marionette');

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

// Main application initialization
// this is global on purpose. sucks i know.
Graft = new Marionette.Application();

_.extend(Graft, {
    models: {},
    views: {},
    routers: {},
    middleware: {},

    bundles: {
        views : [],
        models: [],
        routers: [],
        templates: [],
        vendor: []
    }
});



Graft.addInitializer(function(options) {
    require('./templates/index.js');
    require('./models/index.js');
    require('./views/index.js');
    require('./routers/index.js');
});

Graft.on('start', function(options) {
    this.conferences = new Graft.models.Conferences();
    this.callers     = new Graft.models.Callers();
});

module.exports = Graft;
