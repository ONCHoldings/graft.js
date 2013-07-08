var assert  = require('assert');
var request = require('request');
var Graft   = require('./fixture/index.js');
var testUrl = 'http://localhost:8900';

describe('REST API', function() {
    beforeEach(function() {
      //  Graft.trigger('reset');
    });

    describe('GET /api/Account/1', function() {
        it ('should succeed', function (done) {
            request(testUrl + '/api/Account/1', function(err, resp, body) {
                it ('should not cause an error', function() {
                    assert.equal(err, null, 'err is not null'); 
                });
                it ('should return status 200', function() {
                    console.log(resp);
                    assert.equal(resp.statusCode, 200, 'statusCode is not 200');
                });
                done();
            });
        });
    });
});
