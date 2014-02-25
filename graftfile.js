var Graft = require('./lib/modules'); // Bootstrap module system.
var path  = require('path');
global.__graftPath = path.normalize(__dirname + '/graft.js');
Graft.__graftPath = global.__graftPath;

// initialize system layout
Graft.system('Server', 'server', {
   bundle: 'server'
});
Graft.system('Data', 'data', {
    kind: 'data',
    path: 'data'
});
Graft.system('IO', 'io', {
    kind: 'io',
    path: 'io'
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
Graft.bundle('shared', './lib/mixins', __dirname);
Graft.bundle('shared', './lib/augment', __dirname);

Graft.bundle('vendor', 'jquery', 'jquery-browserify');
Graft.bundle('vendor', 'debug');
Graft.bundle('vendor', 'async');
Graft.bundle('vendor', 'underscore');
Graft.bundle('vendor', 'underscore.string');
Graft.bundle('vendor', 'underscore.deferred');
Graft.bundle('vendor', 'f_underscore/f_underscore');
Graft.bundle('vendor', 'backbone');
Graft.bundle('vendor', 'backbone.marionette');
Graft.bundle('vendor', 'backbone.wreqr');
Graft.bundle('vendor', 'backbone.babysitter');

// Important to call after bundles/systems are registered,
// but before we include any servers and things.
Graft.directory(path.dirname(global.__graftPath));

module.exports = Graft;
