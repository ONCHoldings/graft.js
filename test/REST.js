var Graft  = require('./fixture/index.js');
var utils  = require('./utils');
var should = require('should');
var _      = require('underscore');


describe('REST ROUTES', function() {
    describe('GET /api/Account/1', function() {

        before(utils.requestUrl('/api/Account/1'));

        it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be json', function() {
            this.resp.should.be.json;
        });

        it ('should have a body', function() {
            should.exist(this.body);
        });

        it('body should parse', utils.parseBody);

        it('should have the correct id', function() {
            this.body.should.have.property('id', '1');
        });
    });

    describe('GET /api/Account', function() {
        before(utils.requestUrl('/api/Account'));

        it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be json', function() {
            this.resp.should.be.json;
        });

        it ('should have a body', function() {
            should.exist(this.body);
        });

        it('body should parse', utils.parseBody);

        it ('should have 5 models', function() {
            this.body.should.have.length(5);
        });

    });
});
