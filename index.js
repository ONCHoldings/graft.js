var tropo_webapi = require('tropo-webapi');
var express = require('express');
var app = express();

app.use(express.logger());
app.use(express.bodyParser());

app.get('/', function(req, res) {
    res.send("sigh");
});

app.post('/session.json', function (req, res) {
    console.log(req.body || {}); 
    var tropo = new TropoWebAPI();
 
    tropo.say("Welcome to the conference!");
    //(id, mute, name, playTones, required, terminator)
    tropo.conference("1234", null, "conference", null, null, null);

    res.send(TropoJSON(tropo));
 
});

app.listen(12400); 
