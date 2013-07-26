// Main Server-side entry point for Graft.
var _              = require('underscore');
var Marionette     = require('backbone.marionette');
var path           = require('path');
var fs             = require('fs');
var Graft          = require('./lib/modules'); // Bootstrap module system.
Graft.server       = true; // Hopefully this will be unecessary one day.
global.__graftPath = __dirname + '/graft.js';

// initialize system layout
Graft.system('Middleware', 'middleware', {
   bundle: 'middleware'
});
Graft.system('Data', 'data', {
    kind: 'data',
    path: 'data'
});

Graft.system('Template', 'templates', {
    bundle: 'templates',
    transform: 'jade',
    extension: '.jade'
});

Graft.system('Model', 'models', {
    bundle: 'models',
    instances: '$models'
});

Graft.system('View', 'views', {
    bundle: 'views',
    instances: '$views'
});

Graft.system('Router', 'routers', {
    bundle: 'routers',
    instances: '$routers'
});

Graft.system('Client', 'client', {
    bundle: ['client', 'vendor', 'shared']
});

// Include the shared code for the client too.
Graft.bundle('shared', 'graftjs', global.__graftPath);
Graft.bundle('shared', './lib/mixins.js', __dirname);
Graft.bundle('shared', './lib/augment.js', __dirname);

Graft.bundle('vendor', 'jquery', 'jquery-browserify');
Graft.bundle('vendor', 'debug');
Graft.bundle('vendor', 'async');
Graft.bundle('vendor', 'underscore');
Graft.bundle('vendor', 'underscore.string');
Graft.bundle('vendor', 'underscore.deferred');
Graft.bundle('vendor', 'f_underscore');
Graft.bundle('vendor', 'backbone');
Graft.bundle('vendor', 'backbone.marionette');
Graft.bundle('vendor', 'backbone.wreqr');
Graft.bundle('vendor', 'backbone.babysitter');

// Load up the primary Server middleware. (required)
require('./middleware/Server.graft.js');

// Load up the Data API
require('./data/Data.graft.js');


// Bind the Server middleware's express route handlers to the
// Application Object.
//
// This allows you to just use Graft.VERB(path, fn) to register
// routes on the system.
//
// We can't just _.extend this, because the start methods
// on our already extended modules will conflict.
var Server = Graft.Middleware.Server;
var expressMethods = ['all', 'get', 'post', 'delete', 'use', 'set', 'configure'];

_.each(expressMethods, function(method) {
    Graft[method] = function() {
        var args = Array.prototype.slice.call(arguments);
        return Server[method].apply(Server, args);
    };
}, this);

Graft.addInitializer(function(opts) {
    Graft.execute('data:setup', opts);
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

Graft.start = _.wrap(Graft.start.bind(Graft), function(fn, config) {
    fn(Graft.request('config:load', config));
});

Graft.reset = function() {
    this.resetBundles();
};

module.exports = Graft;
