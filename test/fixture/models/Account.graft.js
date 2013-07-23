module.exports = Graft.BaseModel.extend({
    urlRoot: '/api/Account',
    defaults: {
        group: 'default',
        status: 'offline'
    }
});
