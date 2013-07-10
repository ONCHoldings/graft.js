module.exports = Backbone.Marionette.CompositeView.extend({
    itemView: Graft.$views.Caller,
    itemViewContainer: '#callers',
    template: require('../templates/Callers.jade'),
    emptyView: Graft.$views.NoCallers
});
