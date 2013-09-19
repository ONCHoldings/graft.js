/**
 * Server that generates and serves the client side app.
*/
var verboseDebug  = require('debug')('verbose:graft:client');
var express       = require('express');
var http          = require('http');
var path          = require('path');
var Browserify    = require('browserify');
var jadeify2      = require('jadeify2');
var _             = require('underscore');
var wrapTransform = require('../lib/wrap.transform');
var _express      = express();
this.express      = _express;
this._server       = http.createServer(this.express);


_.defaults(this, _express);

/**
* Set all the relevant handlers.
*/
Graft.Server.on('listen', listen, this);
Graft.commands.setHandler('bundle:mount', mountBundle, this);
Graft.on('bundle:process', bundleBrowserify , this);
Graft.reqres.setHandler('bundle:noParse', noParse, this);
Graft.reqres.setHandler('bundle:externals', getExternals, this);
Graft.reqres.setHandler('bundle:defaults', defaultBundles, this);
this.addInitializer(initializeBundles);
this.addInitializer(addToLocals);

/**
* Exclude certain files from being parsed by browserify
*/
this._noParse = [];

Graft.request('bundle:noParse',[
    'jquery', 'debug', 'async', 'underscore',
    'underscore.string', 'underscore.deferred',
    'f_underscore/f_underscore', 'backbone',
    'backbone.marionette', 'backbone.wreqr',
    'backbone.babysitter'
]);

function noParse(file) {
    if (_.isArray(file)) {
        this._noParse = this._noParse.concat(file);
    } else if (_.isString(file)) {
        this._noParse.push(file);
    }
    return this._noParse;
}


/**
* Keep track of all browserify bundles in the externals control array.
*/

this.external = [];
function getExternals() { return this.external || []; }

function bundleBrowserify(name, brwsfy) {
    brwsfy._pkgcache = {};
    // TODO: this should not be necessary
    brwsfy._noParse = _(brwsfy._noParse).uniq();
    debug('browserify', name, _.pick(brwsfy, '_mapped', '_external'));
    this.external.push(brwsfy);
}


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
    var b = new Browserify({exposeAll: true});
    var bundle = Graft.bundles[bundleName];

    if (options.transform) { b.transform(options.transform); }

    function eachExternal(e) { b.external(e); }
    _(Graft.request('bundle:externals')).each(eachExternal);


    var noParse = Graft.request('bundle:noParse');
    function eachNoParse(e) { b.noParse(e); }
    _(noParse).each(eachNoParse);



    function mapBundleExpose(files, expose) {
        var files = _([files]).flatten();

        _.each(files, function(file) {
            if (options.entry) { return b.add(file); }

            verboseDebug('require', expose, makeRelative(file));


            if (_(noParse).include(expose) && (expose !== file)) {
                Graft.request('bundle:noParse', file);
            }
            b.require(file,{ expose:  expose });
        });
    }
    _(bundle).each(mapBundleExpose);

    function build(err, src) {
        if (err) { debug('error', err); return dfr.reject(err); }

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

function makeRelative(file) {
    var rel = path.relative(process.cwd(), file);
    return (/^\./).test(rel) ? rel : './' + rel;
}

var jadeTransFn = _.wrap(jadeify2, function(fn, file, options) {
    return fn(file, { client: true, filename: makeRelative(file), compileDebug: false });
});

function defaultBundles(options) {
    return {
        'vendor'  : { },
        'templates': { transform : jadeTransFn },
        'shared'  : { transform : wrapTransform.through },
        'models'  : { transform : wrapTransform.through },
        'views'   : { transform : wrapTransform.through },
        'routers' : { transform : wrapTransform.through },
        'client'  : { entry     : true }
    };
}

// Populate the list of scripts to be iterated over in the template
function addToLocals(options) {
    var locals = options.locals || {};
    var nonce = Date.now();
    var bundles = Graft.request('bundle:defaults');

    var files = _(bundles).keys();

    _.defaults(locals, {
        includes: _(files).map(mapFn)
    });

    function mapFn(m, k) {
    var tpl = _.template('{{prefix}}/{{script}}.js?v={{version}}');
        return tpl({ prefix  : '/js', script  : m, version : nonce });
    }
}

/**
* Initialize the bundles to be served to the client
*/
function initializeBundles(options) {
    var bundles = Graft.request('bundle:defaults');
    Graft.execute('wait', buildBundles(bundles));
}

/**
* Respond to the main server being started.
*/
function listen(server) {
    debug('Mounting client to server');
    server.use(this);
}

