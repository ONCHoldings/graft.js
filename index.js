var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var request = require('request');
var _ = require('underscore');

require('./shared');
require('./setup')(app);

app.get('/', function(req, res) {
    res.render('layout', {});
});

var io = require('socket.io').listen(server);

var Conference = require('./models/Conference');
var Conferences = require('./models/Conferences');
var Caller = require('./models/Caller');
var Callers = require('./models/Callers');

var cons = new Conferences();

cons.on('add', function(model) {
    io.sockets.emit('conferences:add', model.toJSON());
});

var calls = new Callers();

var users = []; // new (require('./models/Callers'))();

app.post('/session.json', function (req, res) {
    var conf;
    var headers = req.body.session.headers;

    var tropo = new TropoWebAPI();

    if (!cons.size()) {
        conf = new Conference();
        cons.add(conf);
        tropo.say("New Conference Room Created")
    } else {
        conf = cons.last();
    }
    conf.callers.add([
        new Caller({
            id: headers['x-phonoid'],
            socket: headers['x-socketid'],
            conf: conf.cid
        })
        ]);
    tropo.say("Added to room " + conf.cid);
    tropo.conference(conf.cid, null, "conference", null, null, null);

    res.send(TropoJSON(tropo));
});


io.configure(function() {
  io.enable("browser client minification");
  io.enable("browser client etag");
  io.enable("browser client gzip");
  io.set("destroy upgrade", false);
  io.set("log level", 1);
  io.set("transports", ["websocket", "htmlfile", "xhr-polling", "jsonp-polling"]);
});

io.sockets.on("connection", function(socket) {
    socket.emit('conferences:reset', cons);
  socket.on("hello", function(jid) {
    users.push({socket: socket.id.toString(), jid: jid});
    io.sockets.emit("queue", users.length);
  });
  socket.on("disconnect", function() {
    var userFilter = users.filter(function (user) { return user.socket == socket.id.toString() });
    if (userFilter && userFilter.length){
      users.splice(users.indexOf(userFilter[0]), 1);      
      io.sockets.emit("queue", users.length);
    }
  });
});


server.listen(12400);
