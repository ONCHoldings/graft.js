var express      = require('express');
var connect      = require('connect');
var cookie       = require('cookie');
var tropo_webapi = require('tropo-webapi');
var browserify   = require('browserify-middleware');
var jadeify2     = require('jadeify2');
var jade         = require('jade');
var glob         = require('glob');
var http         = require('http');
var fs           = require('fs');
var _            = require('underscore');


var $ = global.$ = require('jquery');
var App = require('./shared');
Graft = global.Graft = App;

require('./server/modules.js');
require('./servers/Core.graft.js');

_.extend(Graft, Graft.servers.Core);


// Initialize the sockets
App.addInitializer(function socketConfig(options) {
    var io = this.io = require('socket.io').listen(this.server);

    io.configure(function() {
        io.enable("browser client minification");
        io.enable("browser client etag");
        io.enable("browser client gzip");
        io.set("destroy upgrade", false);
        io.set("log level", 1);
        io.set("transports", ["websocket", "htmlfile", "xhr-polling", "jsonp-polling"]);
    });

    io.set('authorization', function socketAuth(handshakeData, accept) {
        if (handshakeData.headers.cookie) {
            handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
            handshakeData.sessionID = connect.utils.parseSignedCookie(
                handshakeData.cookie['express.sid'], 'secret'
            );

            if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
                console.log('cookie is invalid');
                return accept('Cookie is invalid.', false);
            }
        } else {
                console.log('no cookie transmitted');
            return accept('No cookie transmitted.', false);
        } 
        accept(null, true);
    });
});


module.exports = App;
