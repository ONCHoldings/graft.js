var $        = global.$ || require('jquery');
var _        = require('./lib/mixins');

// Set the DOM lib for Backbone.
var Backbone = require('backbone');
Backbone.$   = $;

// Needs to happen before marionette is included.
var Marionette = require('backbone.marionette');
Marionette.$   = $;

// augment helper to backbone objects.
require('./lib/augment');

// Main application initialization
// this is global on purpose. sucks i know.
var Graft = new Marionette.Application();

// These are mapped in such a way so that modules
// are able to integrate with other dependencies.
Graft.BaseModel      = Backbone.Model;
Graft.BaseCollection = Backbone.Collection;

_.extend(Graft, {
    '$models'     : {},
    '$views'      : {},
    '$routers'    : {},
    '$server' : {}
});
 
Graft.addInitializer(function(options) {
    this.$state = {};
});

module.exports = Graft;
