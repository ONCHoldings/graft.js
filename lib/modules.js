var path = require('path');
var glob = require('glob');
var fs = require('fs');
var jade = require('jade');
var _ = require('underscore');

_.extend(Graft, {
    models: {},
    views: {},
    routers: {},
    middleware: {},

    bundles: {
        views : [],
        models: [],
        routers: [],
        templates: [],
        vendor: []
    }
});

// Default template engine.
require.extensions['.jade'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    var name = path.basename(filename).replace(/\..+$/, '');

    try {
        module.exports = jade.compile(content);
        Graft.bundles.templates.push[filename];
    } catch (err) {
        var lines = err.message.split('\n');
        lines.splice(1, 0, '    in template ' + filename);
        err.message = lines.join('\n');
        throw err;
    }
};

// Legacy underscore template support
require.extensions['._'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    var name = path.basename(filename).replace(/\..+$/, '');

    try {
        module.exports = _.template(content);
        Graft.bundles.templates.push[filename];
    } catch (err) {
        var lines = err.message.split('\n');
        lines.splice(1, 0, '    in template ' + filename);
        err.message = lines.join('\n');
        throw err;
    }
};


var wrapTransform = require('./wrap.transform.js');

require.extensions['.graft.js'] = function(module, filename) {
    var kind = _.singularize(path.basename(path.dirname(filename)));

    Graft.bundles[kind] && Graft.bundles[kind].push(filename);
    var content = fs.readFileSync(filename, 'utf8');
    module._compile(wrapTransform.compile(filename, content), filename);
};


// Cannot only add .graft.js to known extensions because path.ext() only looks
// at what is after last '.' so we override '.js' handling.
var _requirejs = require.extensions['.js'];
require.extensions['.js'] = function(module, filename) {
    if (/^.+\.graft\.js$/.test(filename))
        return require.extensions['.graft.js'](module,filename);
    Graft.bundles['vendor'] && Graft.bundles['vendor'].push(filename);
    return _requirejs(module, filename);
}
