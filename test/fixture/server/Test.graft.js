// A simple test server to confirm module system works.
var express  = require('express');
var http     = require('http');

var _express = express();
this.express = _express;
this._server  = http.createServer(this.express);
_.defaults(this, _express);

this.listening = false;

var greek = 'alpha';
this.greekLetter = greek;
this.initOrder = [];
this.loadOrder = [];
this.loadOrder.push(greek);
// Mount all the rest api routes
this.addInitializer(function(opts) {

    this.initOrder.push(greek);

    debug('Initialize Test Server');
    this.get('/test', function(req, res) {
        res.send('Hello world');
    });

    this.get('/test/:name', function(req, res) {
        res.send('Hello ' + req.params.name);
    });
});

Graft.Server.on('listen', function(Server) {
    debug('Mounting test routes');
    this.listening = true;
    Server.use(this);
}, this);
