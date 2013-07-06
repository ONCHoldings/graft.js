module.exports = Backbone.Model.extend({
    urlRoot: '/api/Caller',
    defaults: {
        conference: 'default',
        status: 'offline'
    }
});
