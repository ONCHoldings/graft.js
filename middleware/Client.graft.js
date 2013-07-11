/**
 * Server that generates and serves the client side app.
*/
var express  = require('express');
var http     = require('http');

var _express = express();
this.express = _express;
this.server  = http.createServer(this.express);
_.extend(this, _express);

var Browserify = require('browserify');
var bmw        = require('browserify-middleware');
var jadeify2   = require('jadeify2');
var jade       = require('jade');
var path       = require('path');
var glob       = require('glob');
var fs         = require('fs');
var _          = require('underscore');

var wrapTransform = require('../lib/wrap.transform');

// Browserify templates
this.addInitializer(function templates(options) {
    // Import templates
    var templates = glob.sync('./templates/*.jade');
    var transFn = _.wrap(jadeify2, function(fn, file, options) {
        // dirty kludge to fix the part issue in the jadeify2 transform
        return fn(file, { client: true, filename: file, compileDebug: false });
    });
    this.external = _.clone(templates);

    this.get('/js/templates.js', bmw(templates, {transform: transFn}));
});

/**
 * Browserify vendor includes
 */
this.addInitializer(function vendor(options) {
    var b = new Browserify();
    _(this.external).each(function(e) {
        b.external(e);
    });

    _(Graft.bundles.vendor).each(function(exp, file) {
        var arg = (exp === file) ? {expose: file} : {};
        b.require(exp, arg );
    });

    this.get('/js/vendor.js',function(req, res, next) {
        b.bundle(function(err, src) {
            res.setHeader('content-type', 'text/javascript');
            res.send(err || src);
        });
    });
});

function makeRelative(p) {
    return path.relative(process.cwd(), path.resolve(__dirname + '../'),  p);
}

this.addInitializer(function(opts) {
    function bfyFn(type) {
        var files = _(Graft.bundles[type]).map(makeRelative);
        
        this.get('/js/' + type +'.js', bmw(files, {
            external: this.external,
            transform: wrapTransform.through
        }));
        this.external = this.external.concat(files);
    }

    bfyFn.call(this, 'models');
    bfyFn.call(this, 'views');
    bfyFn.call(this, 'routers');
    bfyFn.call(this, 'shared');
    bfyFn.call(this, 'client');

    // Handle shared code between server and client.
//    this.get('/js/graft.shared.js', bmw(['./graft.shared.js'], {external: this.external}));
 //   this.external.push('./graft.shared.js');

    // Finally, the initialization code.
   // this.get('/js/graft.client.js', bmw('../graft.client.js', {external: this.external}));
});

Graft.Middleware.on('listen', function(server) {
    debug('Mounting client to server');
    server.use(this);
}, this);
