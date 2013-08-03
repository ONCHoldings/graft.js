var through       = require('through');
var _             = require('./mixins.js');
var path          = require('path');
var Graft         = require('../graft');
var debug         = require('debug')('graft:transform:wrap');
var verboseDebug  = require('debug')('verbose:graft:transform:wrap');
var wrapper       = require('./wrap._');
var modulePathTpl = _.template("{{sysName}}.{{name}}");

function makeRelative(file) {
    var rel = path.relative(process.cwd(), file);
    return (/^\./).test(rel) ? rel : './' + rel;
}

function compile(filename, content, client, template) {
    debug('compile', makeRelative(filename));
    var dirname = path.basename(path.dirname(filename));
    var system  = _(Graft.systems).findWhere({ path: dirname });
    var sysName = system && system.name || dirname;

    var wrapFn = wrapper;

    if (template) {
        var wrapFn = template;
    }

    var name    = path.basename(filename).replace(/(\.graft)?\.js/, '');
    var _path   = sysName;

    var subSysName = _(name).classify();
        

    if (sysName.toLowerCase() !== name.toLowerCase()) {
        var _path   = modulePathTpl({
            name    : subSysName,
            sysName : sysName
        });
    }

    var opts = {
        filename     : filename,
        relFilename  : makeRelative(filename),
        content      : content,
        graftPath    : client ? 'graftjs' : global.__graftPath,
        system       : system,
        module       : {
            kind     : system && system.kind || dirname,
            sysName  : sysName,
            name     : name,
            safeName : subSysName,
            path     : _path,
            fn       : subSysName + 'Module'
        }
    };

    var kinds   = _(Graft.systems).chain()
        .where({ transform: 'wrap' })
        .pluck('name')
        .value();


    var ret = _.include(kinds, sysName) ? wrapFn(opts) : content;
    verboseDebug('source :' + filename, ret);
    return ret;
}

function _through(file) {
    debug('through: ', makeRelative(file));
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
