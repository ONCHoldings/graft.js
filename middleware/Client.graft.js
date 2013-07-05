/**
 * Server that generates and serves the client side app.
 */

var Browserify = require('browserify');
var bmw        = require('browserify-middleware');
var jadeify2   = require('jadeify2');
var jade       = require('jade');
var through    = require('through');
var path       = require('path');
var glob       = require('glob');
var fs         = require('fs');
var _          = require('underscore');

/**
 * Browserify templates
 */
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

    // Import vendor stuff
    var vendor = {
        'jquery-browserify' : {},
        './templates/index.js' : {}, 
        'underscore' : {},
        'underscore.string' : {},
        'backbone' : {},
        'backbone.marionette' : {},
        'jqueryui-browser/ui/jquery-ui.js' : {expose: 'jquery-ui'},
        './assets/js/jquery.phono.js' : {expose: 'jquery.phono'},
    };

    _.each(vendor, function(v, k) {
        var data = _.defaults(v, { 
            expose: k
        });

        b.require(k, data);
        this.external.push(k);
    }, this);

    this.get('/js/vendor.js', function(req, res, next) {
        b.bundle(function(err, src) {
            res.setHeader('content-type', 'text/javascript');
            res.send(err || src);
        });
    });
});

this.addInitializer(function(opts) {
    function bfyFn(type, matchStr) {
        var b = new Browserify();

        var process = require.extensions['.graft.js'].process;

        b.transform(function(file) {
            var buffer = '';
            function read(data) {
                buffer = buffer + data;
            }
            function write() {
                this.queue(process(file, buffer));
                this.queue(null);
            }
            return through(read, write);
        });
        _(this.external).each(function(e) {
            b.external(e);
        });

        var files = glob.sync(matchStr);

        _.each(files, function(v) {
            b.require(v, { expose: v });
            this.external.push(v);
        }, this);

        this.get('/js/'+type+'.js', function(req, res, next) {
            b.bundle(function(err, src) {
                res.setHeader('content-type', 'text/javascript');
                res.send(err || src);
            });
        });
    }

  //  bfyFn.call(this, 'resources', './resources/*.json');
    bfyFn.call(this, 'models', './models/*.graft.js');
    bfyFn.call(this, 'views', './views/*.graft.js');
    bfyFn.call(this, 'routers', './routers/*.graft.js');

    // Handle shared code between server and client.
    this.get('/js/graft.shared.js', bmw(['./graft.shared.js'], {external: this.external}));
    this.external.push('./graft.shared.js');

    // Finally, the initialization code.
    this.get('/js/graft.client.js', bmw('../graft.client.js', {external: this.external}));
});
