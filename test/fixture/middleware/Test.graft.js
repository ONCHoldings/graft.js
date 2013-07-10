// A simple test middleware to confirm module system works.
var express  = require('express');
var http     = require('http');

var _express = express();
this.express = _express;
this.server  = http.createServer(this.express);
_.extend(this, _express);

this.listening = false;

var greek = 'alpha';
this.greekLetter = greek;
this.initOrder = [];
this.loadOrder = [];
this.loadOrder.push(greek);
// Mount all the rest api routes
this.addInitializer(function(opts) {

    this.initOrder.push(greek);

    debug('Initialize Test Middleware');
    this.get('/test', function(req, res) {
        res.send('Hello world');
    });

    this.get('/test/:name', function(req, res) {
        res.send('Hello ' + req.params.name);
    });
});

Graft.Middleware.on('listen', function(Server) {
    debug('Mounting test routes');
    this.listening = true;
    Server.use(this);
}, this);

