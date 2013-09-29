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
Graft.reqres.setHandler('bundle:ignore', ignore, this);
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
    'backbone.babysitter', 'jquery-browserify'
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
* Exclude certain files from being added to bundles entirely.
*/
this._ignore = [];

Graft.request('bundle:ignore', []);

function ignore(file) {
    if (_.isArray(file)) {
        this._ignore = this._ignore.concat(file);
    } else if (_.isString(file)) {
        this._ignore.push(require.resolve(file));
    }
    return this._ignore;
}

/**
* Keep track of all browserify bundles in the externals control array.
*/

this.external = [];
function getExternals() { return this.external || []; }

function bundleBrowserify(name, brwsfy) {
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
    var builds = {};
    var dfr = new _.Deferred();
    var builtPromise = dfr.promise();

    _(bundles).reduce(reduceBuilds, true);

    _.when(..._(builds).toArray())
        .then(dfr.resolve, dfr.reject);

    return builtPromise;

    // helper functions

    function reduceBuilds(previous, bundle, name) {
        var _dfr = new _.Deferred();

        _dfr.then((...args) =>
            Graft.execute('bundle:mount', name, ...args));

        _.when(previous).then(() =>
            buildBundle(name, bundle)
                .then(_dfr.resolve, _dfr.reject));

        builds[name] = _dfr.promise();
        return builds[name];
    }
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
    var b        = new Browserify({exposeAll: true});
    var dfr      = _.Deferred();
    var options  = options || {};
    var bundle   = Graft.bundles[bundleName];
    var noParse  = Graft.request('bundle:noParse');
    var ignore   = Graft.request('bundle:ignore');
    var external = Graft.request('bundle:externals');
    var transfm  = options.transform && _([options.transform]).flatten();

    _(ignore).each(  e => b.ignore(e));
    _(transfm).each( e => b.transform(e));
    _(external).each(e => b.external(e));
    _(noParse).each( e => b.noParse(e));

    _(bundle).each((files, expose) => {
        _([files]).chain()
            .flatten()
            .each(mapFile);
    });

    b.bundle((err, src) => {
        if (err) { return dfr.reject(err);  }

        Graft.trigger('bundle:process', bundleName, b);
        dfr.resolve(src);
    });

    return dfr.promise();

    // helper functions

    function mapFile(file, expose) {
        if (options.entry)
            return b.add(file);

        let inNoParse = _(noParse).include(expose);
        let notExpose = expose !== file;

        if (inNoParse && notExpose)
            Graft.request('bundle:noParse', file);

        b.require(file,{ expose:  expose });
    }
}

/**
 * Mount a bundle against the client express server.
 */
function mountBundle(name, src) {
    debug('mount', name);
    this.get('/js/' + name + '.js', (req, res, next) => {
        res.setHeader('Content-Type', 'text/javascript');
        res.send(src);
    });
}

function makeRelative(file) {
    var rel = path.relative(process.cwd(), file);
    return (/^\./).test(rel) ? rel : './' + rel;
}

var jadeTransFn = _.wrap(jadeify2, (fn, file, options) => fn(file, {
        client: true,
        filename: makeRelative(file),
        compileDebug: false
    }));

function defaultBundles(options) {
    return {
        'vendor'  : { transform: ['debowerify', 'deamdify'] },
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

