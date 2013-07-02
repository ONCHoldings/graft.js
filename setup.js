var express = require('express');

var browserify = require('browserify-middleware');
var jadeify2 = require('jadeify2');
var glob = require('glob');

var _ = require('underscore');

module.exports = function(app) {
    app.locals.siteName = 'Student Edge: Discovery';
    app.locals.title = 'Student Edge: Discovery';
    app.locals.secret = 'good thing this is just a demo, right?';

    app.set('views', __dirname + '/templates');
    app.set('view engine', 'jade');


    app.configure('production', function() {
        app.enable('trust proxy');
    });

    app.use(express.static(__dirname + '/assets'));

    // Import templates
    var templates = glob.sync('./templates/*.jade');
    var transFn = _.wrap(jadeify2, function(fn, file, options) {
        // dirty kludge to fix the part issue in the jadeify2 transform
        return fn(file, { client: true, filename: file, compileDebug: false });
    });
    app.get('/js/templates.js', browserify(templates, {transform: transFn}));
    var external = _.clone(templates);

    // Import vendor stuff
    var vendor = [
        'jquery-browserify', 'underscore',
        'base64url', 'backbone',
        'backbone.marionette', 'jqueryui-browser/ui/jquery-ui.js',
        './shared.js'
    ];
    app.get('/js/vendor.js', browserify(vendor, {ignore: ['jquery-browser']}));
    external = external.concat(vendor);

    // Import resources
    var resources = glob.sync('./resources/*.json');
    app.get('/js/resources.js', browserify(resources, {external: external}));
    external = external.concat(resources);

    // Import models
    var models = glob.sync('./models/*.js');
    app.get('/js/models.js', browserify(models, {external: external}));
    external = external.concat(models);

    // Import views
    var views = glob.sync('./views/*.js');
    app.get('/js/views.js', browserify(views, {external: external}));
    external = external.concat(views);

    // Import routers
    var routers = glob.sync('./routers/*.js');
    app.get('/js/routers.js', browserify(routers, {external: external}));
    external = external.concat(routers);

    // Finally, the initialization code.
    app.get('/js/client.js', browserify('./client.js', {external: external}));
}
