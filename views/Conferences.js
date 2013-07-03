var Backbone = require('backbone'),
    _ = require('underscore');


module.exports = Backbone.Marionette.CompositeView.extend({
    itemView: require('./Conference.js'),
    itemViewContainer: '#conferences',
    template: require('../templates/Conferences.jade'),
    emptyView: require('./NoConferences.js'),
});

