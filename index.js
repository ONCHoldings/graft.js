var App = require('./server');

App.get('/', function(req, res) {
    res.render('layout', {});
});

App.post('/session.json', function (req, res) {
    var tropo = new TropoWebAPI();

    tropo.say("Added to room " + conf.cid);
    tropo.conference(conf.cid, null, "conference", null, null, null);

    res.send(TropoJSON(tropo));
});

App.start();
