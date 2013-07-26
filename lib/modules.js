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


var bundles = {
    templates: [],
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
        extension   : '.graft.js',
        instances   : false,
        bundle      : false,
        transform   : 'wrap',
        directories : []
    };

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
    debug(system + ' config', config);
    systems[system] = config;
};


// Default template engine.
require.extensions['.jade'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');

    try {
        module.exports = jade.compile(content);
    } catch (err) {
        var lines = err.message.split('\n');
        lines.splice(1, 0, '    in template ' + filename);
        err.message = lines.join('\n');
        throw err;
    }
    Graft.bundles.templates.push(filename);
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
    if (/^.+\.graft\.js$/.test(filename))
        return require.extensions['.graft.js'](module,filename);
    return _requirejs(module, filename);
};

function isRelPath(str) { return (/^\.\//).test(str); }
function isAbsPath(str) { return (/^\//).test(str); }

// Add bundle method to add it to the internal bundles array
Graft.bundle = function(bundle, expose, source) {
    // Temp variables so we keep the original state.
    var _expose = expose,
        _source = source;

    if (source) {
        if (isRelPath(expose) && isAbsPath(source)) {
            _source = path.resolve(path.join(source,expose));
        }
    } else {
        _source = expose;
    }

    if (this.bundles[bundle]) {
        Graft.trigger('bundle:add', bundle, _expose, _source);
        this.bundles[bundle][_expose] = _source;
    }
};

/**
 * Load up a Graft module.
 *
 * Each module may contain several components, which
 * are to be included automatically.
 */
Graft.load = function(dir, force) {
    debug('loading', dir);

    _(Graft.systems).chain()
        .pluck('path')
        .each(this.require.bind(this, dir));

    if (this.directories.indexOf(dir) < 0) {
        this.directories.push(dir);
        if (fs.existsSync(dir + '/client.js')) {
            debug('Automatically including client.js');
            Graft.bundle('client', './client.js', dir);
        }
    }
    return this;
};

// Sort alphabetically.
function alphabetical(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}

// require a directory
Graft.require = function(dir, systemPath) {
    var system = _(Graft.systems).findWhere({ path: systemPath });
    var dir = path.join(dir, systemPath);

    var alreadyLoaded = _(system.directories).include(dir);

    if (!alreadyLoaded) {
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
    } else {
        debug('already loaded', dir);
    }

    return this;
};

// add a component to the variables where we keep track of these things
Graft.add = function(component, filename) {
    var dirname = path.basename(path.dirname(filename));
    var system = _(Graft.systems).findWhere({ path: dirname });

    if (!component.files) component.files = [];
    component.files.push(filename);

    if (!component.title) {
        component.title = path.basename(filename).replace(/\.graft.js$/, '');
    }

    var bundle = _([system.bundle]).flatten()[0];
    bundle && Graft.bundles[bundle] && (Graft.bundles[dirname][component.title] = component.files);
    Graft.bundles.order.push(filename);
};

module.exports = Graft;
