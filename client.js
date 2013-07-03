var $ = require('jquery-browserify');
var  _ = require('underscore'),
    Backbone = require('backbone'),
    Marionette = require('backbone.marionette'),
    ui = require('jqueryui-browser/ui/jquery-ui.js');

//window.$ = window.jQuery = $;

require('./assets/js/jquery.phono.js');

var App = window.App = require('./shared.js');

/**
 * Backbone.js client side initialization.
 */
App.addInitializer(function(options) {
    // start a router
    this.appRouter = new this.routers.App();

    // Manage the initial regions
    this.addRegions({
        sidebar: '#sidebar',
        main: '#main'
    });
    this.sidebar.show(new this.views.Conferences({
        collection: this.Conferences
    }));

    this.main.show(new this.views.Callers({
        collection: this.Callers
    }));

    // Start the path tracking
    Backbone.history.start({pushState: true, silent: false, root: "/"});
});

/**
 * Socket.io initialization
 */
App.addInitializer(function(options) {
    this.socket = io.connect();
    this.socket.on('data', function (data) {
        console.log(data);
    });

    this.socket.on('error', function (reason){
        console.error('Unable to connect Socket.IO', reason);
    });

    this.socket.on('connect', function (){
        console.info('successfully established a working and authorized connection');
    });
});

/**
* Phono.js initialization
*/
App.addInitializer(function(options) {
    this.phono = $.phono({
        apiKey: "fadd626b7b4942ef4e2d26490e331dde",
        audio: {
            type: 'auto',
            media: {
                audio: true,
                video: false
            }
        },
        onReady: function(evt, phone) {
            App.vent.trigger('phonoReady', evt, phone);
        }
    });
});

App.vent.on('phonoReady', function(evt, phone) {
    var myPhonoId = App.phono.sessionId;
    var mySocketId = App.socket.socket.sessionid;
    App.socket.emit("phonoReady", App.phono.sessionId);

    this.phone.dial("app:9991484224", {
        headers: [
            { name: 'x-socketid', value: mySocketId },
            { name: 'x-phonoid', value: myPhonoId}
        ]
    });
});

App.start();
