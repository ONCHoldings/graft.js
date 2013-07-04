var path = require('path');
var fs = require('fs');
var util = require('util');
var assert = require('assert');
var Module = require('module');
var _ = require('underscore');

// Load wrappers
var wrappers = {};
fs.readdirSync(__dirname).forEach(function(name) {
    var match = name.match(/^(.+)\.(prefix|suffix)\.js$/);
    if (match) {
        wrappers[match[1]] = wrappers[match[1]] || {};
        wrappers[match[1]][match[2]] =
            fs.readFileSync(path.join(__dirname, name), 'utf8')
                .split('\n').join('');
    }
});

require.extensions['.bones.js'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    var kind = utils.singularize(path.basename(path.dirname(filename)));

    wrappers[kind] = wrappers[kind] || {};
    wrappers[kind].prefix = wrappers[kind].prefix || '';
    wrappers[kind].suffix = wrappers[kind].suffix || '';

    content = wrappers[kind].prefix + ';' + content + '\n;' + wrappers[kind].suffix;
    module._compile(content, filename);

    if (module.exports) {
        Bones.plugin.add(module.exports, filename);
    }
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
};

// Legacy underscore template support
require.extensions['._'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    var name = path.basename(filename).replace(/\..+$/, '');

    try {
        module.exports = _.template(content);
        Bones.plugin.add(module.exports, filename);
    } catch (err) {
        var lines = err.message.split('\n');
        lines.splice(1, 0, '    in template ' + filename);
        err.message = lines.join('\n');
        throw err;
    }

    module.exports.register = function(app) {
        if (app.assets && !(/\.server\._$/.test(filename))) {
            app.assets.templates.push({
                filename: filename,
                content: 'template = ' + module.exports.source + ';'
            });
        }
    };
};
