module.exports = Backbone.Model.extend({
    defaults: {
        policy: 'deny'
    },
    urlRoot: '/api/Group'
});
