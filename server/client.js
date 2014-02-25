/**
 * Server that generates and serves the client side app.
*/
var verboseDebug  = require('debug')('verbose:graft:client');
var express       = require('express');
var http          = require('http');
var path          = require('path');
var _             = require('underscore');
var _express      = express();
this.express      = _express;
this._server       = http.createServer(this.express);


_.defaults(this, _express);

/**
* Set all the relevant handlers.
*/
Graft.Server.on('listen', listen, this);
Graft.reqres.setHandler('bundle:defaults', defaultBundles, this);

this.addInitializer(initializeBundles);
this.addInitializer(addToLocals);

/**
 * Mount a bundle against the client express server.
 */
function initializeBundles(opts) {
    this.use('/js', express.static(process.cwd() + '/build/js'));
}

function defaultBundles(options) {
    return [
        'vendor',
        'templates',
        'shared',
        'models',
        'views',
        'routers',
        'client',
    ];
}

// Populate the list of scripts to be iterated over in the template
function addToLocals(options) {
    var locals = options.locals || {};
    var nonce = Date.now();
    var files = Graft.request('bundle:defaults');

    _.defaults(locals, {
        includes: _(files).map(mapFn)
    });

    function mapFn(m, k) {
        var tpl = _.template('{{prefix}}/{{script}}.js?v={{version}}');
        return tpl({ prefix  : '/js', script  : m, version : nonce });
    }
}

/**
* Respond to the main server being started.
*/
function listen(server) {
    debug('Mounting client to server');
    server.use(this);
}

