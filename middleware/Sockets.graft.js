var express  = require('express');
var http     = require('http');

var _express = express();
this.express = _express;
this.server  = http.createServer(this.express);
_.extend(this, _express);

var socketio = require('socket.io');

// Initialize the sockets
Graft.Middleware.on('listen', function socketConfig(Server) {
    debug('initialize socket.io server');

    var io = this.io = socketio.listen(Server.server);

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
