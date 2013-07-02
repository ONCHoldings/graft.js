var Backbone = require('backbone'),
    _ = require('underscore');

var Callers = require('./Callers.js');

module.exports = Backbone.Model.extend({
    initialize: function(opts) {
        this.callers = new Callers(opts && opts.callers || []);
    },
    toJSON: function() {
        return {
            id: this.cid,
            callers: this.callers.toJSON()
        }
    }
});
