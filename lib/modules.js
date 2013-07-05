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

// Load wrappers
var wrappers = {
    model        : require('./wrap.model._'),
    view         : require('./wrap.view._'),
    router       : require('./wrap.router._'),
    middleware   : require('./wrap.middleware._')
};

modulePathTpl = _.template("App.{{kind}}.{{name}}");
function wrapJS(filename, content) {

    var kind = _.singularize(path.basename(path.dirname(filename)));
    var name = path.basename(filename).replace(/\..+$/, '');

    var _path = modulePathTpl({ 
        name: _.capitalize(name),
        kind: _.capitalize(kind)
    });

    var opts = {
        filename: filename,
        content: content,
        module: {
            kind: kind,
            name: name,
            path: _path
        }
    };
    content = wrappers[kind] ? wrappers[kind](opts) : content;
    return content;
};


require.extensions['.graft.js'] = function(module, filename) {
    var kind = _.singularize(path.basename(path.dirname(filename)));

    Graft.bundles[kind] && Graft.bundles[kind].push(filename);
    var content = fs.readFileSync(filename, 'utf8');
    module._compile(wrapJS(filename, content), filename);
};
require.extensions['.graft.js'].process = wrapJS;


// Cannot only add .graft.js to known extensions because path.ext() only looks
// at what is after last '.' so we override '.js' handling.
var _requirejs = require.extensions['.js'];
require.extensions['.js'] = function(module, filename) {
    if (/^.+\.graft\.js$/.test(filename))
        return require.extensions['.graft.js'](module,filename);
    Graft.bundles['vendor'] && Graft.bundles['vendor'].push(filename);
    return _requirejs(module, filename);
}