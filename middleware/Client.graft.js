/**
 * Server that generates and serves the client side app.
*/
var express       = require('express');
var http          = require('http');
var Browserify    = require('browserify');
var bmw           = require('browserify-middleware');
var jadeify2      = require('jadeify2');
var jade          = require('jade');
var path          = require('path');
var async         = require('async');
var glob          = require('glob');
var fs            = require('fs');
var _             = require('underscore');
var wrapTransform = require('../lib/wrap.transform');
var _express      = express();
this.express      = _express;
this.server       = http.createServer(this.express);


_.extend(this, _express);


// Browserify templates
this.addInitializer(function templates(options) {
    // Import templates
    var templates = Graft.bundles.templates;

    var transFn = _.wrap(jadeify2, function(fn, file, options) {
        // dirty kludge to fix the part issue in the jadeify2 transform
        return fn(file, { client: true, filename: file, compileDebug: false });
    });

    _(templates).each(function(f) {
        Graft.trigger('bundle:process', 'templates', f);
    });

    this.get('/js/templates.js', bmw(templates, {transform: transFn, debug:false}));
});


Graft.on('bundle:process', function(bundle, expose, file) {
    this.external = this.external || [];
    this.external.push(expose);
    file && (file !== expose) && this.external.push(file);

}, this)

Graft.reqres.setHandler('bundle:externals', function() {
    return this.external || [];
}, this);

function bundleBuilder(bundleName, options, transFn) {
    var b = new Browserify();

    var bundle = Graft.bundles[bundleName];

    function eachExternal(e) { b.external(e); }

    if (transFn) {
        b.transform(transFn);
    }

    function mapBundleExpose(file, expose) {
        var arg = (expose !== file) ? {expose: expose} : {};
        b.require(file, arg);
        Graft.trigger('bundle:process', 'vendor', expose, file);
    }

    function buildBundle(req, res, next) {
        function sendBundle(err, src) {
            res.setHeader('content-type', 'text/javascript');
            res.send(err || src);
        }
        b.bundle(sendBundle);
    }

    _(Graft.request('bundle:externals')).each(eachExternal);
    _(bundle).each(mapBundleExpose);

    return buildBundle;
}

/**
 * Browserify vendor includes
 */
this.addInitializer(function vendor(options) {
    var opts = { 
        noParse: [
            'jquery', 'backbone', 'underscore', 
            'underscore.string', 'backbone.marionette'
        ]
    };

    this.get('/js/vendor.js', bundleBuilder('vendor', opts));
});

function makeRelative(p) {
    return p;
    return path.relative(process.cwd(), path.resolve(__dirname + '/../'),  p) || p;
}

this.addInitializer(function(opts) {
    function bfyFn(type) {
        var files = _(Graft.bundles[type]).chain()
            .flatten()
            .map(makeRelative)
            .value();

        this.get('/js/' + type +'.js', bmw(files, {
            external: Graft.request('bundle:externals'),
            transform: wrapTransform.through,
            debug: false
        }));
        _(files).each(function(f) {
            Graft.trigger('bundle:process', type, f);
        });
    }

    bfyFn.call(this, 'shared');
    bfyFn.call(this, 'client');
    bfyFn.call(this, 'models');
    bfyFn.call(this, 'views');
    bfyFn.call(this, 'routers');

});

Graft.Middleware.on('listen', function(server) {
    debug('Mounting client to server');
    server.use(this);
}, this);
