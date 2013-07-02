var Backbone = require('backbone'),
    _ = require('underscore');

module.exports = Backbone.Marionette.ItemView.extend({
    tagName: 'article',
    className: 'conference',
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
