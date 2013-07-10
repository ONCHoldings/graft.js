var $        = require('jquery');
var _        = require('./lib/mixins.js');
var Backbone = require('backbone');

// Set the DOM lib for Backbone.
// Needs to happen before marionette is included.
Backbone.$ = $;

var Marionette = require('backbone.marionette');

// augment helper to backbone objects.
require('./lib/augment.js');

// Main application initialization
// this is global on purpose. sucks i know.
Graft = new Marionette.Application();

_.extend(Graft, {
    '$models': {},
    '$views': {},
    '$routers': {},
    '$middleware': {},

    bundles: {
        views : [],
        models: [],
        routers: [],
        templates: [],
        vendor: []
    }
});

Graft.addInitializer(function(options) {
    this.$state = {};
});

module.exports = Graft;
