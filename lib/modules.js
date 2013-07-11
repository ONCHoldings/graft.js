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
var glob  = require('glob');
var debug = require('debug')('graft:modules');
var fs    = require('fs');
var jade  = require('jade');
var async = require('async');
var _     = require('underscore');
var Graft = require('../graft');

Graft.resetBundles = resetBundles;
Graft.resetBundles();

function resetBundles() {
    _.extend(this, {
        directories: [],
        bundles: {
            views : {},
            models: {},
            routers: {},
            templates: [],
            vendor: {},
            middleware: {},
            shared: {},
            client: {},
            order: []
        }
    });
};

function isRelPath(str) { return /^\.\//.test(str); }
function isAbsPath(str) { return /^\//.test(str); }
function isPath(str) { return isRelPath(str) || isAbsPath(str); }
function isModule(str) { return !isPath(str); }

function isDir(str) { } // TODO
function isFile(str) { } // ditto

function resolveRelative() {

}

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

    Graft.trigger('bundle:add', bundle, _expose, _source);
    this.bundles[bundle][_expose] = _source;
}

/**
 * Load up a Graft module.
 *
 * Each module may contain several components, which
 * are to be included automatically.
 */
Graft.load = function(dir, skipClient) {
    if (this.directories.indexOf(dir) < 0) {
        debug('loading', dir);
        this.directories.push(dir);
        this.require(dir, 'routers');
        this.require(dir, 'models');
        this.require(dir, 'templates');
        this.require(dir, 'views');
        //this.require(dir, 'commands'); # TODO

        if (fs.existsSync(dir + '/client.js')) {
            debug('Automatically including client.js');
            Graft.bundle('client', 'client', dir + '/client.js');
        }
    }
    return this;
};

// Sort alphabetically.
function alphabetical(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}

// require a directory
Graft.require = function(dir, kind) {
    dir = path.join(dir, kind);
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
    if (!component.files) component.files = [];
    component.files.push(filename);

    if (!component.title) {
        component.title = path.basename(filename).replace(/\..+$/, '');
    }

    var kind = path.basename(path.dirname(filename));
    Graft.bundles[kind][component.title] = component.files;
    Graft.bundles.order.push(filename);
};

// Default template engine.
require.extensions['.jade'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    var name = path.basename(filename).replace(/\..+$/, '');

    try {
        module.exports = jade.compile(content);
    } catch (err) {
        var lines = err.message.split('\n');
        lines.splice(1, 0, '    in template ' + filename);
        err.message = lines.join('\n');
        throw err;
    }
    Graft.bundles.templates.push[filename];
};

// Legacy underscore template support
require.extensions['._'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    var name = path.basename(filename).replace(/\..+$/, '');

    try {
        module.exports = _.template(content);
    } catch (err) {
        var lines = err.message.split('\n');
        lines.splice(1, 0, '    in template ' + filename);
        err.message = lines.join('\n');
        throw err;
    }
    Graft.bundles.templates.push[filename];
};

// wrap graft modules in marionette clothing
var wrapTransform = require('./wrap.transform.js');

require.extensions['.graft.js'] = function(module, filename) {
    var kind = _.singularize(path.basename(path.dirname(filename)));

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
}

module.exports = Graft;
