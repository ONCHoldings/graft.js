this.view = Backbone.Marionette.ItemView.extend({
    tagName: 'article',
    className: 'caller',
    modelEvents: {
        'change': 'render'
    },
    template: require('../templates/Caller.jade'),
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
