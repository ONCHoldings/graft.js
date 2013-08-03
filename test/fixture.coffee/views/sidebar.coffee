module.exports = Backbone.Marionette.Layout.extend(
  template: require "../../fixture/templates/sidebar.jade"
  regions:
    head: "#head"
    foot: "#foot"
    middle: "#middle"
)
