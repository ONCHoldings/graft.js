var Backbone = require('backbone'),
    Constraint = require('./Constraint.js');

var view = module.exports = Constraint.extend({
    template: require('../templates/Options.jade'),
    ui: {
        value: 'select option:selected',
        options: 'select'
    },
    setValue: function(value) {
        this.ui.options.val(value);
    },
    triggers: {
        'change select' : 'value:change',
        'click a.close' : 'removeConstraint'
    },
    templateHelpers: {
        getOptions: function() {
            return this.model.options || ['none'];
        }
    }
});
