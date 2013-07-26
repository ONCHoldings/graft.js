/**
 * Server that generates and serves the client side app.
*/
var express       = require('express');
var http          = require('http');
var Browserify    = require('browserify');
var bmw           = require('browserify-middleware');
var jadeify2      = require('jadeify2');
var _             = require('underscore');
var wrapTransform = require('../lib/wrap.transform');
var _express      = express();
this.express      = _express;
this.server       = http.createServer(this.express);


_.extend(this, _express);


// Browserify templates
this.addInitializer(function bundleTemplates(options) {
    // Import templates
    var templates = Graft.bundles.templates;

    var transFn = _.wrap(jadeify2, function(fn, file, options) {
        // dirty kludge to fix the part issue in the jadeify2 transform
        return fn(file, { client: true, filename: file, compileDebug: false });
    });

    _(templates).each(function(f) {
        Graft.trigger('bundle:process', 'templates', f);
    });

    this.get('/js/templates.js', bmw(templates, {transform: transFn, debug:false, cache: false}));
});


Graft.on('bundle:process', function(bundle, expose, file) {
    this.external = this.external || [];
    this.external.push(expose);
    file && (file !== expose) && this.external.push(file);
}, this);

Graft.reqres.setHandler('bundle:externals', function() {
    return this.external || [];
}, this);

function bundleBuilder(bundleName, options, transFn) {
    var options = options || {};

    var b = new Browserify();

    var bundle = Graft.bundles[bundleName];
    debug("bundleBuilder for " + bundleName);

    function eachExternal(e) { b.external(e); }

    if (transFn) {
        b.transform(transFn);
    }

    function mapBundleExpose(file, expose) {
        var arg = {
            expose: (expose !== file) ? expose : file
        };

        if (options.entry) {
            b.add(file);
        } else {
            b.require(file, arg);
        }
        Graft.trigger('bundle:process', 'vendor', expose, file);
    }

    function buildBundle(req, res, next) {
        function sendBundle(err, src) {
            if (err) {
                res.setHeader('Content-Type', 'application/json');
                return res.send(500, JSON.stringify({error: err.toString()}));
            }

            res.setHeader('Content-Type', 'text/javascript');
            res.send(src);
        }

        b.bundle(sendBundle);
    }

    _(Graft.request('bundle:externals')).each(eachExternal);
    _(bundle).each(mapBundleExpose);

    return buildBundle;
}

 // vendor
this.addInitializer(function vendor(options) {
    this.get('/js/vendor.js', bundleBuilder('vendor'));
});

this.addInitializer(function(opts) {
    function bfyFn(type) {
        var files = _(Graft.bundles[type]).flatten();
        var externals = Graft.request('bundle:externals');
        var options = {
            external: externals,
            transform: wrapTransform.through,
            debug: false
        };

        this.get('/js/' + type +'.js', bmw(files, options));
        _(files).each(_.partial(Graft.trigger, 'bundle:process', type));
    }

    bfyFn.call(this, 'shared');
    bfyFn.call(this, 'models');
    bfyFn.call(this, 'views');
    bfyFn.call(this, 'routers');
});

//  client 
this.addInitializer(function client(options) {
    this.get('/js/client.js', bundleBuilder('client', { entry: true}));
});


Graft.Middleware.on('listen', function(server) {
    debug('Mounting client to server');
    server.use(this);
}, this);
