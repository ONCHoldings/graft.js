var Backbone = require('backbone');
var Graft  = window.Graft  = require('./graft.shared.js');

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
        collection: this.State.conferences
    }));

    this.main.show(new this.views.Callers({
        collection: this.State.callers
    }));

    // fetch some data
    this.State.conferences.fetch();
    this.State.callers.fetch();

    // Start the path tracking
    Backbone.history.start({pushState: true, silent: false, root: "/"});
});

Graft.start();
