var Backbone = require('backbone');
// probably dont even need this.

module.exports = Backbone.Router.extend({
    initialize: function(opt) {
    },
    routes: {
        '*query' : 'search'
    },
    search: function(query) {
        // weirdly, dont need to do a thing.
    }
});
