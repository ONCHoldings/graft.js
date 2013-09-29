// Main Server-side entry point for Graft.
var _              = require('underscore');
var Marionette     = require('backbone.marionette');
var path           = require('path');
var fs             = require('fs');
var debug          = require('debug')('graft:server');
var Graft          = require('../lib/modules'); // Bootstrap module system.
Graft.server       = true; // Hopefully this will be unecessary one day.
global.__graftPath = path.normalize(__dirname + '/../graft.js');

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

var expressFns = ['get', 'post', 'delete', 'put', 'use', 'set', 'configure'];

_.each(expressFns, method => Graft[method] = Server[method].bind(Server));

Graft.addInitializer(opts => {
    Graft.execute('server:setup', opts);
    Graft.Data.execute('setup', opts);
});

// Stop this module by running its finalizers and then stop all of
// the sub-modules for this application
    // sub-modules are stopped / finalized before parents
Graft.stop = () => {
    Graft.triggerMethod("before:stop");
    _.each(Graft.submodules, mod => mod.stop());
    Graft._initCallbacks.reset();
    Graft.triggerMethod("stop");
};

Graft.reqres.setHandler('config:load', (config) => {
    var file   = path.join(process.cwd(), 'config.json');
    var config = config || {};

    if (fs.existsSync(file)) {
        try {
            _.extend(config, require(file));
        } catch(e) {
            console.error(utils.colorize('Invalid JSON config file: ' + path.basename(file), 'red'));
            process.exit(2);
        }
    }
    return config;
});

var _promises = [];
var ready = Graft.ready = new _.Deferred();

Graft.commands.setHandler('wait', promise => _promises.push(promise));

Graft.start = _.wrap(Graft.start.bind(Graft), (start, config) => {
    var config = Graft.request('config:load', config);

    ready = Graft.ready = new _.Deferred();

    start(config);

    return Graft.ready.promise();
});

Graft.on('start',() => {
    _.when(null, ..._promises)
        .then(ready.resolve, ready.reject);
});

Graft.reset = () => {
    Graft.resetBundles();
    Graft.systems = {};
};

module.exports = Graft;
