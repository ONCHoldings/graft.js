var Backbone = require('backbone');
var Graft  = window.Graft  = require('./graft.shared.js');


Graft.addInitializer(function(options) {
    require('./models/index.js');
    require('./views/index.js');
    require('./routers/index.js');
});
/**
 * Backbone.js client side initialization.
 */
Graft.on('start', function(options) {
    // start a router
    this.appRouter = new this.$routers.App();

    // Manage the initial regions
    this.addRegions({
        sidebar: '#sidebar',
        main: '#main'
    });
    this.$state.conferences = new this.$models.Conferences();
    this.$state.callers = new this.$models.Callers();

    this.sidebar.show(new this.$views.Conferences({
        collection: this.$state.conferences
    }));

    this.main.show(new this.$views.Callers({
        collection: this.$state.callers
    }));

    // fetch some data
//    this.$state.conferences.fetch();
//    this.$state.callers.fetch();

    // Start the path tracking
    Backbone.history.start({push$state: true, silent: false, root: "/"});
}, Graft);

Graft.start();
