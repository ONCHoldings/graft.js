
module.exports = Backbone.Marionette.Layout.extend({
//    template: require('../templates/Sidebar.jade'),
    regions: {
        'head' : '#head',
        'foot' : '#foot',
        'middle': '#middle'
    }
});
