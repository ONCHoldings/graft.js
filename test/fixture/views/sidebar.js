
module.exports = Backbone.Marionette.Layout.extend({
    template: require('../templates/sidebar.jade'),
    regions: {
        'head' : '#head',
        'foot' : '#foot',
        'middle': '#middle'
    }
});
