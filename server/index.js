// Main Server-side entry point for Graft.
var _              = require('underscore');
var Marionette     = require('backbone.marionette');
var path           = require('path');
var fs             = require('fs');
var debug          = require('debug')('graft:server');
var Graft          = require('../graftfile'); // Bootstrap module system.
Graft.server       = true; // Hopefully this will be unecessary one day.

// Load up the primary Server server. (required)
require('./server');

// Load up the Data API
require('../data');

// Bind the Server server's express route handlers to the
// Application Object.
//
// This allows you to just use Graft.VERB(path, fn) to register
// routes on the system.
//
// We can't just _.extend this, because the start methods
// on our already extended modules will conflict.
var Server = Graft.Server;

var expressFns = ['get', 'post', 'delete', 'put', 'use', 'set', 'all', 'configure'];

_.each(expressFns, function(method) {
    Graft[method] = Server[method].bind(Server);
}, this);

Graft.addInitializer(function(opts) {
    Graft.execute('server:setup', opts);
    Graft.Data.execute('setup', opts);
});

// Stop this module by running its finalizers and then stop all of
// the sub-modules for this application
Graft.stop = function(){
    Marionette.triggerMethod.call(this, "before:stop");

    // stop the sub-modules; depth-first, to make sure the
    // sub-modules are stopped / finalized before parents
    _.each(this.submodules, function(mod){ mod.stop(); });
    this._initCallbacks.reset();

    Marionette.triggerMethod.call(this, "stop");

};

Graft.reqres.setHandler('config:load', function(config) {
    var file   = path.join(process.cwd(), 'config.json');
    var config = config || {};

    if (fs.existsSync(file)) {
        try {
            _.extend(config, JSON.parse(fs.readFileSync(file, 'utf8')));
        } catch(e) {
            console.error(utils.colorize('Invalid JSON config file: ' + path.basename(file), 'red'));
            process.exit(2);
        }
    }
    return config;
}, Graft);

var readyPromises = [];

Graft.commands.setHandler('wait', function(promise) {
    readyPromises.push(promise);
});


Graft.start = _.wrap(Graft.start.bind(Graft), function(start, config) {
    var config = Graft.request('config:load', config);

    Graft.ready = new _.Deferred();

    start(config);

    return Graft.ready.promise();
});

Graft.on('start', function() {
    _.when.apply(_, [null].concat(readyPromises))
        .then(Graft.ready.resolve, Graft.ready.reject);
});

Graft.reset = function() {
    Graft.resetBundles();
    Graft.systems = {};
};

module.exports = Graft;
