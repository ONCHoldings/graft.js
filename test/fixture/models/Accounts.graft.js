module.exports = Backbone.Collection.extend({
    url: '/api/Account',
    model: Graft.models.Account
});
