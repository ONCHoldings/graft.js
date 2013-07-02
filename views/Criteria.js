var Backbone = require('backbone'),
    _ = require('underscore');

module.exports = Backbone.Marionette.CompositeView.extend({
    itemView: require('./Constraint.js'),
    itemViewContainer: '#criteria',
    template: require('../templates/Criteria.jade'),
    emptyView: require('./NoConstraints.js'),
    triggers: {
        'click a.addConstraint': 'addConstraint'
    },
    ui: {
        criteria: '#criteria',
        constraints: '#criteria .constraint'
    },
    buildItemView: function(item, ItemViewType, itemViewOptions) {
        var options = _.extend({model: item}, itemViewOptions);

        var ViewType = ItemViewType;

        if (item instanceof App.models.Options) {
            if (!item.notNull) {
                ViewType = App.views.Checkboxes;
            } else {
                ViewType = App.views.Options;
            }
        }
        
        return new ViewType(options);
    },
    onAddConstraint: function(e) {
        var _tempKeys = ['CanStillApply', 'StateCode', 'Type', 'StudentBody', 'FoundingYear'];
        var ind = this.collection.size() % _(_tempKeys).size();
        var model = _tempKeys[ind];

        App.searchCriteria.add(
            new App.models.Fields[model]({
                id: _.uniqueId(model.field)
            })
        );


    },
    onRender: function() {
        var that = this;
        this.ui.criteria.sortable({
            cursor: 'move',
            items: '.constraint',
            update: function(evt, ui) {
                var ids = $(evt.target).sortable('toArray', {attribute: 'data-id'});
                App.execute('constraintOrder', ids);
            }
        });
    }
});
