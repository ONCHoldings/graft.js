/**
 * Helper functions for testing REST requests.
 *
 * The resulting test code is significantly easier
 * to understand with these abstracted out.
 */
var should  = require('should');
var request = require('request');

var testUrl = 'http://localhost:';
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

        request(testUrl + port + pathname, opts, function(err, resp, body) {
            self.resp = resp;
            self.body = body;
            done(err);
        });
    };
}

module.exports = {
    parseBody: parseBody,
    requestUrl: requestUrl
};
