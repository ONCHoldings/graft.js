var Backbone = require('backbone'),
    _ = require('underscore');

module.exports = Backbone.Marionette.ItemView.extend({
    className: 'constraint',
    template: require('../templates/Constraint.jade'),
    ui: { 
        value: 'input.value'
    },
    triggers: {
        'change input.value': 'value:change',
        'click a.close' : 'removeConstraint'
    },
    serializeData: _.compose(
        function(data) {
            data.model = this.model;
            return data;
        },
        Backbone.Marionette
            .ItemView
            .prototype
            .serializeData
    ),
    onValueChange: function() {
        this.bindUIElements();
        this.model.set('value', this.ui.value.val());
    },
    setValue: function(value) {
        this.ui.value.val(value);
    },
    onRender: function() {
        this.$el.attr('data-id', this.model.id);
        var value = this.model.get('value');
        if (value) {
            this.setValue(value);
        } else {
            this.model.set('value', this.ui.value.val());
        }
    },
    onRemoveConstraint: function(e) {
        App.searchCriteria.remove(this.model);
    }
});
