var through = require('through');
var _ = require('./mixins.js');
var path = require('path');
var Graft = require('../graft');

// Load wrappers
var wrappers = {
    middleware   : require('./wrap.middleware._'),
    'default': require('./wrap._')
};

modulePathTpl = _.template("{{kind}}.{{name}}");

function compile(filename, content) {
    var dirname = path.basename(path.dirname(filename));

    var system = _(Graft.systems).findWhere({ path: dirname });

    if (!system) { return content; }

    var kind = system.kind;
    var name = path.basename(filename, '.graft.js');

    var _path = modulePathTpl({ 
        name: name,
        kind: _.capitalize(kind)
    });

    // If this module is named the same as the system
    // name (eg: data/Data.graft.js) consider it a root module.
    var isRootModule = Graft.systems[name] &&
        (Graft.systems[name].path === dirname);

    if (isRootModule) {
        _path = name;
    }

    var opts = {
        filename  : filename,
        content   : content,
        graftPath : Graft.server ? global.__graftPath : 'graftjs',
        system    : system,
        module    : {
            kind     : kind,
            name     : name,
            safeName : name.replace(/\./g, ''),
            path     : _path,
            fn       : _path.replace(/\./g, '') + 'Module'
        }
    };
    var wrapper = wrappers[kind] || wrappers['default'];
    var kinds   = _(Graft.systems).pluck('kind');

    var ret = _.include(kinds, kind) ? wrapper(opts) : content;
    return ret;
}

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
};
