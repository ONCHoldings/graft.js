var App = require('./server');

var ns = new (require('Nonsense'))();
var _ = require('underscore');

App.get('/', function(req, res) {
    res.render('layout', {});
});

App.post('/session.json', function (req, res) {
    var tropo = new TropoWebAPI();

    tropo.say("Added to room " + conf.cid);
    tropo.conference(conf.cid, null, "conference", null, null, null);

    res.send(TropoJSON(tropo));
});

App.addInitializer(function(options) {
    this.conferences.on('add', function(model) {
        this.io.sockets.emit('conferences:add', this.conferences.toJSON());
    }, this);

    this.callers.on('add', function(model) {
        this.io.sockets.emit('callers:add', this.callers.toJSON());
    }, this);


    // regardless of anything else, we always want a default conference.
    this.conferences.add({id: 'default'});

    function onConnect(socket) {
        socket.emit('conferences:reset', this.conferences);

        this.callers.add({
            id: ns.name()
        });

        socket.on('phoneReady', function (data) {
            socket.emit('tryPhone', "app:9991484224");
        });
    }

    this.io.sockets.on('connection', _.bind(onConnect, this));

});


App.start();
