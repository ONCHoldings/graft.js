module.exports = Backbone.Model.extend({
    urlRoot: '/api/Account',
    defaults: {
        group: 'default',
        status: 'offline'
    }
});
