var Backbone = require('backbone'),
    _ = require('underscore');

module.exports = Backbone.Marionette.ItemView.extend({
    tagName: 'article',
    className: 'caller',
    template: require('../templates/Caller.jade')
});

