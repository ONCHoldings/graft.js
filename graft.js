var $        = require('jquery');
var _        = require('./lib/mixins.js');

// Set the DOM lib for Backbone.
var Backbone = require('backbone');
Backbone.$   = $;
//
// Needs to happen before marionette is included.
var Marionette = require('backbone.marionette');
Marionette.$   = $;
//
// augment helper to backbone objects.
require('./lib/augment.js');

// Main application initialization
// this is global on purpose. sucks i know.
var Graft = new Marionette.Application();

_.extend(Graft, {
    '$models'     : {},
    '$views'      : {},
    '$routers'    : {},
    '$middleware' : {}
});
 
Graft.addInitializer(function(options) {
    this.$state = {};
});

module.exports = Graft;
