var Graft = require('./server.js');

var ns = new (require('Nonsense'))();
var _ = require('underscore');

var browserify = require('browserify');



Graft.get('/', function(req, res) {
    debugger;
    res.render('layout', {});
});

/*
App.post('/session.json', function (req, res) {
    var tropo = new TropoWebAPI();
    var headers = req.body.session.headers;
    var caller = App.callers.get(headers['x-userid']);

    caller.set('status', 'available');

    tropo.say("Welcome,  " + caller.id);
    tropo.say("Added to room " + caller.get('conference'));
    tropo.conference(caller.get('conference'), null, "conference", null, null, null);

    res.send(TropoJSON(tropo));
});

App.addInitializer(function(options) {
    this.conferences.on('add', function(model) {
        this.io.sockets.emit('conferences:add', this.conferences.toJSON());
    }, this);

    this.callers.on('add', function(model) {
        this.io.sockets.emit('callers:add', model.toJSON());
    }, this);

    this.callers.on('change', function(model) {
        this.io.sockets.emit('caller:change', model.id, model.changed);
    }, this);

    // regardless of anything else, we always want a default conference.
    this.conferences.add({id: 'default'});

    function onConnect(socket) {
        socket.emit('conferences:reset', this.conferences);
        socket.emit('callers:reset', this.callers);

        console.log('socket connected' , socket.id);

        function getSessionId(socket) {
            var id = socket.id;
            var handshake = socket.manager.handshaken[id];
            return handshake.sessionID;
        };

        var id = getSessionId(socket);
        var caller = this.callers.findWhere({sessionId: id});

        if (!caller) {
            this.callers.add({id: ns.name(),sessionId: id });
            var caller = this.callers.findWhere({sessionId: id});
        }

        socket.on('phonoReady', function (data) {
            console.log('socket ' + socket.id + ' connected to phono');
            caller.set('status', 'connected');
            socket.emit('phoneTropo', "app:9991484224", caller.id);
        });

        socket.on('conferences:add', function(model) {
            this.conferences.add(model);
        });
    }

    this.io.sockets.on('connection', _.bind(onConnect, this));
});

*/
App.start();
