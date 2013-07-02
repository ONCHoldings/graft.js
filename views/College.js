var Backbone = require('backbone'),
    _ = require('underscore');

module.exports = Backbone.Marionette.ItemView.extend({
    tagName: 'article',
    className: 'college',
    template: require('../templates/College.jade'),
    templateHelpers: {
        canDrawTable: function() {
            var deadlines = [
                this.freshman,
                this.out_of_state,
                this.transfer,
                this.early_decision,
                this.early_action_plan
            ];
            return _.any(deadlines, function(m) {
                return !!m.deadline;
            });
        }
    }
});
