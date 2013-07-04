var path = require('path');
var glob = require('glob');
var fs = require('fs');
var jade = require('jade');
var _ = require('underscore');

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
    } catch (err) {
        var lines = err.message.split('\n');
        lines.splice(1, 0, '    in template ' + filename);
        err.message = lines.join('\n');
        throw err;
    }
};


// Load wrappers
var wrappers = _.map(glob.sync('./server/*.wrap._'), function(file) {
    return require('./' + path.basename(file));
});


modulePathTpl = _.template("Graft.{{kind}}.{{name}}");
require.extensions['.graft.js'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8');
    var kind = utils.singularize(path.basename(path.dirname(filename)));
    var name = path.basename(filename).replace(/\..+$/, '');

    var path = modulePathTpl({ 
        name: _.capitalize(name),
        kind: _.capitalize(kind)
    });

    var opts = {
        filename: filename,
        content: content,
        module: {
            kind: kind,
            name: name,
            path: path
        }
    };
console.log(opts);
    content = wrappers[kind] ? wrappers[kind](opts) : content;

    module._compile(content, filename);
};


