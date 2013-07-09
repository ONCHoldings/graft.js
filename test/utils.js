/**
 * Helper functions for testing REST requests.
 *
 * The resulting test code is significantly easier
 * to understand with these abstracted out.
 */
var should  = require('should');
var url     = require('url');
var request = require('request');

var testUrl = 'http://localhost:8900';
function parseBody() {
    try {
        this.body = JSON.parse(this.body);
    } catch (e) {
        should.fail(null, null, 'not valid json');
    }
}

function requestUrl(pathname, method, body) {
    return function(done) {
        var self = this;
        var opts = {};
        opts.method = method || 'GET';

        opts.json = body || true;

        request(testUrl + pathname, opts, function(err, resp, body) {
            self.resp = resp;
            self.body = body;
            done(err);
        });
    }
}

module.exports = {
    parseBody: parseBody,
    requestUrl: requestUrl
};
