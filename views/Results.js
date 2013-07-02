var Backbone = require('backbone');

module.exports = Backbone.Marionette.CompositeView.extend({
    itemView: require('./College.js'),
    itemViewContainer: '#results',
    template: require('../templates/Results.jade'),
    emptyView: require('./NoResults.js')
});
