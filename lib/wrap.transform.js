var through = require('through');
var _ = require('./mixins.js');
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var Graft = require('../graft');

// Load wrappers
var wrappers = {
    model        : require('./wrap.model._'),
    view         : require('./wrap.view._'),
    router       : require('./wrap.router._'),
    middleware   : require('./wrap.middleware._')
};

modulePathTpl = _.template("{{kind}}.{{name}}");

function compile(filename, content) {
    var kind = _.singularize(path.basename(path.dirname(filename)));
    var name = path.basename(filename).replace(/\..+$/, '');

    var _path = modulePathTpl({ 
        name: name,
        kind: _.capitalize(kind)
    });

    var opts = {
        filename: filename,
        content: content,
        graftPath: Graft.server ? global.__graftPath : 'graftjs',
        module: {
            kind: kind,
            name: name,
            path: _path,
            fn: _path.replace(/\./g, '') + 'Module'
        }
    };
    content = wrappers[kind] ? wrappers[kind](opts) : content;
    return content;
};

function _through(file) {
    var buffer = '';
    function data(data) {
        buffer = buffer + data;
    }
    function end() {
        this.queue(compile(file, buffer));
        this.queue(null);
    }
    return through(data, end);
}

module.exports = {
    compile: compile,
    through: _through
}
