var Backbone = require('backbone');
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
