var $ = require('jquery-browserify');
var  _ = require('underscore'),
    Backbone = require('backbone'),
    Marionette = require('backbone.marionette');

var Graft = window.Graft = require('./graft.shared.js');


/**
 * Backbone.js client side initialization.
 */
Graft.on('start', function(options) {
    // start a router
    this.appRouter = new this.routers.App();

    // Manage the initial regions
    this.addRegions({
        sidebar: '#sidebar',
        main: '#main'
    });
    this.sidebar.show(new this.views.Conferences({
        collection: this.conferences
    }));

    this.main.show(new this.views.Callers({
        collection: this.callers
    }));

    // Start the path tracking
    Backbone.history.start({pushState: true, silent: false, root: "/"});
});

Graft.start();
