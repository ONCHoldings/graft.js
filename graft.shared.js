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
    models: {},
    views: {},
    routers: {},
    middleware: {},

    bundles: {
        views : [],
        models: [],
        routers: [],
        templates: [],
        vendor: []
    }
});

Graft.addInitializer(function(options) {
    require('./templates/index.js');
    require('./models/index.js');
    require('./views/index.js');
    require('./routers/index.js');
});

Graft.addInitializer(function(options) {
    this.State = {};
    this.State.conferences = new Graft.models.Conferences();
    this.State.callers     = new Graft.models.Callers();
});

module.exports = Graft;
