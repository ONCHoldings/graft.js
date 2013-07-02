var Backbone = require('backbone'),
    _ = require('underscore');


module.exports = Backbone.Marionette.CompositeView.extend({
    itemView: require('./Caller.js'),
    itemViewContainer: '#callers',
    template: require('../templates/Callers.jade'),
    emptyView: require('./NoCallers.js')
});

