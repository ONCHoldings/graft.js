module.exports = Backbone.Marionette.ItemView.extend({
    tagName: 'li',
    className: 'active',
    template: require('../templates/Conference.jade'),
    serializeData: _.compose(
        function(data) {
            data.model = this.model;
            return data;
        },
        Backbone.Marionette
            .ItemView
            .prototype
            .serializeData
    ),

});
