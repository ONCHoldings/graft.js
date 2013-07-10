module.exports = Backbone.Marionette.CompositeView.extend({
    itemView: Graft.$views.Conference,
    itemViewContainer: '#conferences',
    template: require('../templates/Conferences.jade'),
    emptyView: Graft.$views.NoConference,
});
