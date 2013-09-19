/**
* Graft's module system.
*
* This code will interact directly with require(), to
* trigger some extra functionality.
*
* Note: this makes use of require.extensions, which is technically
* deprecated, but has no replacement.
*
* Heavily influenced by Bones.js
*/
var path  = require('path');
var debug = require('debug')('graft:modules');
var fs    = require('fs');
var jade  = require('jade');
var _     = require('./mixins.js');
var Graft = require('../graft');

function makeRelative(file) {
    var rel = path.relative(process.cwd(), file);
    return (/^\./).test(rel) ? rel : './' + rel;
}

var bundles = {
    order: []
};

function resetBundles() {
    _.extend(this, {
        directories: [],
        bundles: _.clone(bundles)
    });
}

Graft.resetBundles = resetBundles;
Graft.resetBundles();

var systems = Graft.systems = {};

Graft.system = function(system, path, config) {
    var defaults = {
        name        : _.capitalize(system),
        path        : path || _.pluralize(system.toLowerCase()),
        extension   : null,
        instances   : false,
        bundle      : false,
        transform   : 'wrap',
        exclude     : ['index.js'],
        directories : [],
        entries     : []
    };

    debug('added system', system);
    var config = config || {};

    if ((_(arguments).size() < 3) && (_.isObject(arguments[2]))) {
        config = arguments[2];
    }
    _.defaults(config, defaults);

    if (config.instances && !_.isString(config.instances) && config.path) {
        config.instances = '$' + config.path;
    }

    if (!config.kind) {
        config.kind = _(path).singularize();
    }

    config.bundle && _([config.bundle]).chain()
        .flatten()
        .each(function(b) {
            if (!bundles[b]) {
                Graft.bundles[b] = bundles[b] = {};
            }
        })
        .value();

    if (config.instances && _.isString(config.instances)) {
        Graft[config.instances] = Graft[config.instances] || {};
    }

    config.path && _(Graft.directories)
        .each(_.partial(systemDirectory, config, system));


    systems[system] = config;
};

// Default template engine.
require.extensions['.jade'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');

    try {
        module.exports = jade.compile(content, {filename: filename});
    } catch (err) {
        var lines = err.message.split('\n');
        lines.splice(1, 0, '    in template ' + filename);
        err.message = lines.join('\n');
        throw err;
    }
    Graft.bundles.templates[filename] = filename;
};

// Legacy underscore template support
require.extensions['._'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');

    try {
        module.exports = _.template(content);
    } catch (err) {
        var lines = err.message.split('\n');
        lines.splice(1, 0, '    in template ' + filename);
        err.message = lines.join('\n');
        throw err;
    }
};

// wrap graft modules in marionette clothing
var wrapTransform = require('./wrap.transform.js');

require.extensions['.graft.js'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    module._compile(wrapTransform.compile(filename, content), filename);
    Graft.add(module, filename);
};

// Cannot only add .graft.js to known extensions because path.ext() only looks
// at what is after last '.' so we override '.js' handling.
var _requirejs = require.extensions['.js'];
require.extensions['.js'] = function(module, filename) {
    if (isSystemModule(filename))
        return require.extensions['.graft.js'](module,filename);
    return _requirejs(module, filename);
};

function isRelPath(str) { return (/^\./).test(str); }
function isAbsPath(str) { return (/^\//).test(str); }

function normalizePath(expose, source) {
    var result = {};

    result.source = path.normalize(path.join(source,expose));
    result.expose = makeRelative(result.source);

    return result;
}

// Add bundle method to add it to the internal bundles array
Graft.bundle = function(bundleName, expose, source) {
    // Temp variables so we keep the original state.
    var _expose = expose,
        _source = source;

    if (source) {
        if (isRelPath(expose) && isAbsPath(source)) {
            var normalized = normalizePath(expose, source);
            _source = normalized.source;
            _expose = normalized.expose;
        }
    } else {
        _source = expose;
    }

    if (!this.bundles[bundleName]) {
        this.bundles[bundleName] = {};
    }
    Graft.trigger('bundle:add', bundleName, _expose, _source);
    debug('bundle', bundleName, _expose, _source);
    this.bundles[bundleName][_expose] = _source;
};

/**
 * Load up a Graft module.
 *
 * Each module may contain several components, which
 * are to be included automatically.
 */
Graft.load = function(dir, force) {
    debug('loading', makeRelative(dir));
    Graft.directory(dir);

    _(Graft.systems).chain()
        .pluck('path')
        .each(this.require.bind(this, dir));

    var clientEntry = dir + '/client.js';
    var clientEntryLoaded = _.include(Graft.systems.Client, clientEntry);

    if (!clientEntryLoaded && fs.existsSync(clientEntry)) {
        debug('Automatically including client.js');
        Graft.bundle('client', './client.js', dir);
    }

    return this;
};

/**
 * Add a directory to be considered a systems directory.
 */
Graft.directory = function(dir) {
    debug('adding system directory', makeRelative(dir));
    if (this.directories.indexOf(dir) < 0) {
        this.directories.push(dir);

        _(Graft.systems).each(function(system, name) {
            systemDirectory(system, name, dir);
        });

        return true;
    }
    return false;
};

function systemDirectory(system, name, dir) {
    if (!system.path) { return false; }
    var fullDir = path.join(dir, system.path);

    if (!_.include(system.directories, fullDir)) {
        try {
            var isDir = fs.statSync(fullDir).isDirectory();
            system.directories.push(fullDir);
            debug('added subsystem directory', name, makeRelative(fullDir));
        } catch (e) {
            debug('not subsystem directory', name, makeRelative(fullDir));
        }
    }
}

/**
 * Return the system, if any, that a file belongs to.
 */
function getSystemFromDirectory(filename) {
    var dirname = path.dirname(filename);

    var findFn = function(system) {
        return _.include(system.directories, dirname);
    };

    return _(Graft.systems).find(findFn);
}

function isSystemModule(filename) {
    return !!getSystemFromDirectory(filename);
}

// Sort alphabetically.
function alphabetical(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}

// require a directory
Graft.require = function(dir, systemPath) {
    var system = _(Graft.systems).findWhere({ path: systemPath });
    var dir = path.join(dir, systemPath);

    var alreadyLoaded = _(system.directories).include(dir);

    try {
        fs.readdirSync(dir).sort(alphabetical).forEach(function(name) {
            var file = path.join(dir, name);

            var isFile = fs.statSync(file).isFile();
            var inExtensions = path.extname(file) in require.extensions;
            var nonHidden = path.basename(file)[0] !== '.';

            if (isFile && inExtensions && nonHidden) {
                require(file);
            }
        });
    } catch(err) {
        if (err.code !== 'ENOENT') throw err;
    }


    return this;
};

// add a component to the variables where we keep track of these things
Graft.add = function(component, filename) {
    var dirname = path.basename(path.dirname(filename));
    var system = _(Graft.systems).findWhere({ path: dirname });
    var expose = makeRelative(filename);
    var bundle = _([system.bundle]).flatten()[0];

    if (bundle && Graft.bundles[bundle]) {
        Graft.bundles[bundle][expose] = filename;
        Graft.bundles.order.push(filename);
    }

};

module.exports = Graft;
