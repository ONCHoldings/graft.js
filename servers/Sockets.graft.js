
// Initialize the sockets
this.addInitializer(function socketConfig(options) {
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

