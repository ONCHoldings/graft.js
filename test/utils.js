/**
 * Helper functions for testing REST requests.
 *
 * The resulting test code is significantly easier
 * to understand with these abstracted out.
 */
var should  = require('should');
var testUrl = 'http://localhost:8900';
var request = require('request');

function parseBody() {
    try {
        this.body = JSON.parse(this.body);
    } catch (e) {
        should.fail(null, null, 'not valid json');
    }
}

function requestUrl(pathname) {
    return function(done) {
        var self = this;
        request(testUrl + pathname, function(err, resp, body) {
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
