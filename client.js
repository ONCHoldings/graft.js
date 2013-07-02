var $ = require('jquery-browserify'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    ui = require('jqueryui-browser/ui/jquery-ui.js');
    
    
require('./assets/js/jquery.phono.js');
require('./shared.js');

// Main application initialization
var App = window.App = new Marionette.Application();

App.addRegions({
    sidebar: '#sidebar',
    main: '#main'
});

App.addInitializer(function(options) {
    App.models = options.models;
    App.templates = options.models;
    App.views = options.views;
    App.routers = options.routers;
    // start a router
    App.appRouter = new App.routers.App();

    App.Conferences =  new App.models.Conferences();

    App.sidebar.show(new App.views.Conferences({
        collection: App.Conferences
    }));

    App.socket = io.connect();
    App.socket.on("queue", function(users) {
      console.log(users);
  });
  App.socket.on("conferences:add", function(conf) {
      App.Conferences.add(conf);
  });
  App.socket.on("conferences:reset", function(conf) {
      App.Conferences.reset(conf, {add: true});
  });
    setupPhono(App);

    Backbone.history.start({pushState: true, silent: false, root: "/"});
});

function setupPhono(App) {
    var myPhonoId, mySocketId, call;
    
    var phono = App.phono = $.phono({
        apiKey: "fadd626b7b4942ef4e2d26490e331dde",
        audio: {
            type: 'auto',
            media: {
                audio: true,
                video: false
            }
        },
        onReady: function(evt, phone) {
            //debugger;
            console.log("phono ready = " + App.phono.sessionId);
            console.log("socket = " + App.socket.socket.sessionid);
            myPhonoId = phono.sessionId;
            mySocketId = App.socket.socket.sessionid;
            App.socket.emit("hello", phono.sessionId);

            this.phone.dial("app:9991484224", {
                headers: [
                    { name: 'x-socketid', value: mySocketId },
                    { name: 'x-phonoid', value: myPhonoId}
                ]
            });
        }

    });
}



App.start({
    templates: require('./templates/index.js'),
    models: require('./models/index.js'),
    views: require('./views/index.js'),
    routers: require('./routers/index.js')
});
