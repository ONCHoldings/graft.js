// heavily based on coffeeify
// https://github.com/substack/coffeeify/blob/master/index.js
var coffee = require('coffee-script');
var through = require('through');
var convert = require('convert-source-map');
var path          = require('path');
var _ = require('underscore');
var fs          = require('fs');
var Graft         = require('../graft');
var debug         = require('debug')('graft:coffee');

function compile(file, data, client, template) {
    var compiled = coffee.compile(data, { sourceMap: true, generatedFile: file, inline: true, literate: isLiterate(file) });
    var comment = convert
        .fromJSON(compiled.v3SourceMap)
        .setProperty('sources', [ file ])
        .toComment();

    return compiled.js + '\n';// + comment;
}

function isCoffee (file) {
    return (/\.((lit)?coffee|coffee\.md)$/).test(file);
}

function isLiterate (file) {
    return (/\.(litcoffee|coffee\.md)$/).test(file);
}

// wrap graft modules in marionette clothing
var wrap = require('./wrap');
var tpl = require('./wrap.coffee._');

require.extensions['.graft.coffee'] = function(module, filename) {
    var content = fs.readFileSync(filename, 'utf8')
        .replace(/^/g,'  ')
        .replace(/\n/g, "\n  ");

    content = compile(filename, wrap.compile(filename, content, false, tpl) );
    module._compile(content, filename);
    Graft.add(module, filename);
};


// Cannot only add .graft.js to known extensions because path.ext() only looks
// at what is after last '.' so we override '.js' handling.
var _requireCoffee = require.extensions['.coffee'];
require.extensions['.coffee'] = function(module, filename) {
    if (Graft.isSystemModule(filename)) {
        debug('is system module');
        return require.extensions['.graft.coffee'](module,filename);
    }
    return _requireCoffee(module, filename);
};

wrap.through = _.wrap(wrap.through, function(fn, file) {
    if (!(/.coffee$/.test(file))) {
        debug('Not Coffeescript');
        return fn(file); 
    }

    debug('coffee script');
    return coffeeThrough(file);
});


var coffeeThrough = module.exports = function (file) {
    if (!isCoffee(file)) return through();

    var data = '';
    return through(write, end);

    function write (buf) { data += buf; }
    function end () {
        var src;
        try {
            src = compile(file, data, true, tpl);
        } catch (error) {
            this.emit('error', error);
        }
        this.queue(src);
        this.queue(null);
    }
};
