var Backbone = require('backbone'),
    Constraint = require('./Constraint.js');

var view = module.exports = Constraint.extend({
    template: require('../templates/Checkboxes.jade'),
    ui: {
        value: 'input.checkbox:checked',
        boxes: 'input.checkbox'
    },
    setValue: function(value) {
        this.ui.boxes.val([value]);
    },
    triggers: {
        'change input.checkbox' : 'value:change',
        'click a.close' : 'removeConstraint'
    },
    templateHelpers: {
        getOptions: function() {
            return this.model.options || ['none'];
        }
    }
});
