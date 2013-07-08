module.exports = Backbone.Model.extend({
    urlRoot: '/api/Account',
    defaults: {
        conference: 'default',
        status: 'offline'
    }
});
