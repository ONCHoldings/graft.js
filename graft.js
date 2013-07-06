var _            = require('underscore');
var $ = global.$ = require('jquery');

Graft = global.Graft = require('./graft.shared');

require('./lib/modules');
require('./middleware');
require('./middleware/Server.graft.js');
require('./middleware/Sockets.graft.js');

var Server = Graft.module('Graft.Middleware.Server');
var Sockets = Graft.module('Graft.Middleware.Sockets');

Server.on('start', function() { 
    console.log('hello');
    Sockets.start();
    this.use(Sockets);
});

_.extend(Graft, Graft.middleware.Server);

module.exports = App = Graft;
