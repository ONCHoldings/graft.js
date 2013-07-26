var through       = require('through');
var _             = require('./mixins.js');
var path          = require('path');
var Graft         = require('../graft');
var debug         = require('debug')('graft:transform:wrap');
var verboseDebug  = require('debug')('verbose:graft:transform:wrap');
var wrapper       = require('./wrap._');
var modulePathTpl = _.template("{{sysName}}.{{name}}");

function compile(filename, content, client) {
    debug('compile', filename);
    var dirname = path.basename(path.dirname(filename));
    var system  = _(Graft.systems).findWhere({ path: dirname });

    var sysName   = system && system.name || dirname;
    var name    = path.basename(filename, '.graft.js');

    var _path   = modulePathTpl({
        name    : name,
        sysName : sysName
    });

    // If this module is named the same as the system
    // name (eg: data/Data.graft.js) consider it a root module.
    var isRootModule = Graft.systems[name] &&
        (Graft.systems[name].path === dirname);

    if (isRootModule) {
        _path = name;
    }

    var opts = {
        filename     : filename,
        content      : content,
        graftPath    : client ? 'graftjs' : global.__graftPath,
        system       : system,
        module       : {
            kind     : system && system.kind || dirname,
            sysName  : sysName,
            name     : name,
            safeName : name.replace(/\./g, ''),
            path     : _path,
            fn       : _path.replace(/\./g, '') + 'Module'
        }
    };

    var kinds   = _(Graft.systems).chain()
        .where({ transform: 'wrap' })
        .pluck('name')
        .value();

    debug('kind', sysName, kinds);
    var ret = _.include(kinds, sysName) ? wrapper(opts) : content;
    verboseDebug('source :' + filename, ret);
    return ret;
}

function _through(file) {
    debug('through: ', file);
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
