var Backbone = require('backbone');
model = Backbone.Model.extend({
    defaults: {
        conference: 'default',
        status: 'offline'
    }
});
