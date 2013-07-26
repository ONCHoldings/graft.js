/*jshint unused:false*/
var should   = require('should');
var _        = require('underscore');
var sinon    = require('sinon');
var utils    = require('./utils');
var Graft    = require('../server');
var testPort = 8903;

Graft.commands.setHandler('Sync:setupTest', function(done) {
    // A simple test data adaptor to debug the REST api.
    var Mock = require('graft-mockdb');

    Graft.load(__dirname + '/fixture');

    Graft.on('reset:data', function() {
        Mock.testData.Account = require('./fixture/resources/Account.json');
        Mock.testData.Group = require('./fixture/resources/Group.json');
    }, Mock);

    Graft.trigger('reset:data');

    Graft.start({ port: testPort });
    done();
});

describe('Backbone Sync implementation', function() {
    before(function(done) {
        Graft.execute('Sync:setupTest', done);
    });
    describe('successfully loading a model', function() {
        before(function(done) {
            var next = _.after(2, function() { done(); });
            this.success = sinon.spy(next);
            this.error = sinon.spy(next);

            this.account = new Graft.$models.Account({ id: "0" });
            this.account.fetch({ success: this.success, error: this.error })
            .then(this.success, this.error);
        });
        it('should not have called the error handlers', function() {
            this.error.callCount.should.eql(0);
        });
        it('should have called both success handlers.', function() {
            this.success.callCount.should.eql(2);
        });
        it('should have the same arguments on both sides.', function() {
            this.success.args[0].should.eql(this.success.args[1]);
        });
    });
    describe('successfully loading a model', function() {
        before(function(done) {
            var next = _.after(2, function() { done(); });
            this.success = sinon.spy(next);
            this.error = sinon.spy(next);


            this.account = new Graft.$models.Account({ id: 'no such user exists' });
            this.account.fetch({ success: this.success, error: this.error })
            .then(this.success, this.error);
        });
        it('should have called both error handlers.', function() {
            this.error.callCount.should.eql(2);
        });
        it('should not have called the success handlers', function() {
            this.success.callCount.should.eql(0);
        });
        it('should have the same arguments on both sides.', function() {
            this.error.args[0].should.eql(this.error.args[1]);
        });
    });

    describe('stop server', utils.stopServer);
});
