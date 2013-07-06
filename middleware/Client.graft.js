/**
 * Server that generates and serves the client side app.
 */
var Browserify = require('browserify');
var bmw        = require('browserify-middleware');
var jadeify2   = require('jadeify2');
var jade       = require('jade');
var path       = require('path');
var glob       = require('glob');
var fs         = require('fs');
var _          = require('underscore');

var wrapTransform = require('../lib/wrap.transform');

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
    // Import vendor stuff
    var vendor = [ 
        'debug',
        'jquery-browserify',
        './templates/index.js',
        'underscore',
        'underscore.string',
        'backbone',
        'backbone.marionette',
        'jqueryui-browser/ui/jquery-ui.js',
        './assets/js/jquery.phono.js'
    ];
    this.get('/js/vendor.js', bmw(vendor, {external: this.external}));
    this.external = this.external.concat(vendor);
});

this.addInitializer(function(opts) {
    function bfyFn(type, matchStr) {
        var files = glob.sync(matchStr);
        this.get('/js/' + type +'.js', bmw(files, {
            external: this.external,
            transform: wrapTransform.through
        }));
        this.external = this.external.concat(files);
    }

    bfyFn.call(this, 'models', './models/*.graft.js');
    bfyFn.call(this, 'views', './views/*.graft.js');
    bfyFn.call(this, 'routers', './routers/*.graft.js');

    // Handle shared code between server and client.
    this.get('/js/graft.shared.js', bmw(['./graft.shared.js'], {external: this.external}));
    this.external.push('./graft.shared.js');

    // Finally, the initialization code.
    this.get('/js/graft.client.js', bmw('../graft.client.js', {external: this.external}));
});


this.addInitializer(function(opts) {
    debug('Mounting client to server');
    Graft.Middleware.Server.use(this);

});

