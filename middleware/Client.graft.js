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

/**
* Mounts all templates to the /js/templates.js path.
*
* Contains a dirty kludge to fix an issue in the jadeify2 transform
*/
function bundleTemplates(options) {
    var templates = Graft.bundles.templates;

    var transFn = _.wrap(jadeify2, function(fn, file, options) {
        return fn(file, { client: true, filename: file, compileDebug: false });
    });

    _(templates).each(function(f) {
        Graft.trigger('bundle:process:templates', 'templates', f);
    });

    this.get('/js/templates.js', bmw(templates, {transform: transFn, debug:false, cache: false}));
}

/**
* Keep track of the templates in the externals control array.
*/
function bundleProcessTemplates(bundle, expose, files) {
    this.external = this.external || [];
    this.external.push(expose);
    files && _.each(files, function(file) {
        (file !== expose) && this.external.push(file);
    }, this);
}

function isRelPath(str) { return (/^\.\//).test(str); }
function isAbsPath(str) { return (/^\//).test(str); }

/**
* Keep track of all browserify bundles in the externals control array.
*/
function bundleBrowserify(name, brwsfy) {
    var external = [];
    external.push(brwsfy.files);
    external.push(_(brwsfy._external).keys());

    var expose = _(brwsfy._expose).chain()
        .reject(isRelPath)
        .reject(isAbsPath)
        .value();
    external.push(expose);

    external = _(external).flatten();
    this.external = _(this.external.concat(external)).unique();
}

/**
* Get the current externals.
*/
function getExternals() { return this.external || []; }

/**
* Build all the bundles requested in series.
*
* @bundles
*     a hash of bundlenames to options for buildBundle
* @returns
*     an promise representing an array of promises to completed bundles.
*/
function buildBundles(bundles) {
    var dfr = new _.Deferred();
    var builtPromise = dfr.promise();

    var builds = {};

    _(bundles).reduce(function (previous, bundle, name) {
        var _dfr = new _.Deferred();

        function doWork() {
            buildBundle(name, bundle)
                .then(_dfr.resolve, _dfr.reject);
        }

        _dfr.then(Graft.execute.bind(Graft, 'bundle:mount', name));

        if (builds[previous]) {
            builds[previous].then(doWork);
        } else {
            doWork();
        }

        builds[name] = _dfr.promise();
        return name;
    }, false);

    _.when.apply(_, _(builds).toArray()).then(function() {
        dfr.resolve(arguments);
    });
    return builtPromise;
}

/**
* Build an individual bundle using browserify.
*
* @bundleName
*     name of the bundle to load.
* @options
*     options to pass to browserify.
* @return
*     promise of a compiled bundle.
*/
function buildBundle(bundleName, options) {
    var dfr = _.Deferred();
    var options = options || {};
    var b = new Browserify();
    var bundle = Graft.bundles[bundleName];

    if (options.transform) { b.transform(options.transform); }

    function eachExternal(e) {
        b.require(e, {external: true});
    }
    _(Graft.request('bundle:externals')).each(eachExternal);


    function mapBundleExpose(files, expose) {
        var files = _([files]).flatten();

        _.each(files, function(file) {
            if (options.entry) { return b.add(file); }

            b.require(file,{ expose:  expose });
        });
    }
    _(bundle).each(mapBundleExpose);

    function build(err, src) {
        if (err) { return dfr.reject(err); }

        Graft.trigger('bundle:process', bundleName, b);
        dfr.resolve(src);
    }
    b.bundle(build);

    return dfr.promise();
}

/**
 * Mount a bundle against the client express server.
 */
function mountBundle(name, src) {
    debug('mount', name);
    this.get('/js/' + name + '.js', function(req, res, next) {
        res.setHeader('Content-Type', 'text/javascript');
        res.send(src);
    });
}

/**
* Initialize the bundles to be served to the client
*/
function initializeBundles(options) {
    Graft.execute('wait', buildBundles({
        'vendor': {},
        'shared': { transform: wrapTransform.through },
        'models': { transform: wrapTransform.through },
        'views': { transform: wrapTransform.through },
        'routers': { transform: wrapTransform.through },
        'client': { entry: true }
    }));
}

/**
* Respond to the main server being started.
*/
function listen(server) {
    debug('Mounting client to server');
    server.use(this);
}

/**
* Set all the relevant handlers.
*/
Graft.Middleware.on('listen', listen, this);
Graft.commands.setHandler('bundle:mount', mountBundle, this);
Graft.on('bundle:process', bundleBrowserify , this);
Graft.on('bundle:process:templates', bundleProcessTemplates, this);
Graft.reqres.setHandler('bundle:externals', getExternals, this);
this.addInitializer(bundleTemplates);
this.addInitializer(initializeBundles);
