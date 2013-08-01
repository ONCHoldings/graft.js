/**
 * Helper functions for testing REST requests.
 *
 * The resulting test code is significantly easier
 * to understand with these abstracted out.
 */
var should  = require('should');
var request = require('request');
var debug   = require('debug')('graft:test:utils');
var Graft   = require('../server');
var testUrl = 'http://localhost:';

var cookieJar = request.jar();

function parseBody() {
    try {
        this.body = JSON.parse(this.body);
    } catch (e) {
        should.fail(null, null, 'not valid json');
    }
}

function requestUrl(port, pathname, method, body) {
    return function(done) {
        var self = this;
        var opts = {};
        opts.method = method || 'GET';
        opts.json = body || true;

        opts.jar = cookieJar;

        debug('requestUrl', testUrl + port + pathname);
        request(testUrl + port + pathname, opts, function(err, resp, body) {
            self.resp = resp;
            self.body = body;
            done(err);
        });
    };
}

function stopServer(){
    cookieJar = request.jar();

    before(function() {
        Graft.stop();
        //Graft.reset();
    });
    it('should be not initialized', function() {
        Graft.Middleware.Server._isInitialized.should.eql(false);
    });
}

module.exports = {
    parseBody: parseBody,
    requestUrl: requestUrl,
    stopServer: stopServer
};
