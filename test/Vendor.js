var utils    = require('./utils');
var should   = require('should');
var path     = require('path');
var _        = require('underscore');
var Backbone = require('backbone');

var testPort = 8901;

var TestBaseModel = Backbone.Model.extend({
    title: 'TestBaseModel'
});

// Initialize the Graft application object.
var Graft = require('../server');

describe('Underscore mixins', function() {
    it('_ should have Deferred', function() {
        should.exist(_.Deferred);
    });

    it('Should have a working Deferred', function(done) {
        var dfr = new _.Deferred();
        dfr.always(done);
        _.delay(dfr.resolve, 10);
    });
    it('_ should have String functions', function() {
        should.exist(_.sprintf);
    });
});

describe('Wreqr event handlers', function() {
    before(function() {
        Graft.commands.setHandler('command:action', function(done) {
            done(null, 'command:action');
        });

        Graft.reqres.setHandler('request:action', function(done) {
            done(null, 'request:action');
            return { 'msg' : 'request:action'};

        });

        Graft.reqres.setHandler('request:promise', function(success) {
            var dfr = new _.Deferred();

            _.delay(function(success) {
                if (success) {
                    dfr.resolve();
                } else {
                    dfr.reject();
                }
            }, 2000, success);
            return dfr.promise();
        });
    });

    it('should fire the correct command.', function(done) {
        Graft.execute('command:action', function(err, arg) {
            should.not.exist(err);
            arg.should.eql('command:action');
            done();
        });
    });

    it('should fire the correct request', function(done) {
        var result = Graft.request('request:action', function(err, arg) {
            should.not.exist(err);
            arg.should.eql('request:action');
            done();
        });

        should.exist(result);
        result.should.have.property('msg', 'request:action');
    });
    it('aliasHandler method should be on prototype', function() {
        Graft.reqres.should.have.property('aliasHandler');
        Graft.commands.should.have.property('aliasHandler');
    });

});


describe('Aliased handlers', function() {
    var context = { context: 'direct' };
    before(function() {
        Graft.reqres.setHandler('alias:task', function(component) {
            return component;
        });

        Graft.reqres.aliasHandler('alias:first:task', 'alias:task', 'first');
        Graft.reqres.aliasHandler('alias:second:task', 'alias:first:task');

        Graft.reqres.setHandler('alias:context', function() {
            return this;
        }, context);

        Graft.reqres.aliasHandler('alias:first:context', 'alias:context', 'first');
    });

    it('direct handler fires correctly', function() {
        var result = Graft.request('alias:task', 'direct');
        result.should.eql('direct');
    });


    it('aliased handler fires correctly', function() {
        var result = Graft.request('alias:first:task');
        result.should.eql('first');
    });

    it('direct handler respects context', function() {
        var result = Graft.request('alias:context');
        result.should.eql(context);
    });

    it('aliased handler respects context', function() {
        var result = Graft.request('alias:first:context');
        result.should.eql(context);
    });

    it('should be possible to alias an alias', function() {
        var result = Graft.request('alias:second:task');
        result.should.eql('first');
    });

    describe('Switching out underlying handlers', function() {
        before(function() {
            Graft.reqres.setHandler('alias:task', function() {
                return 'override';
            });
            Graft.reqres.setHandler('alias:second:task', function(arg) {
                return 'override:' + arg;
            });
        });

        it('Should fire the overridden handler directly', function() {
            var result = Graft.request('alias:task', 'direct');
            result.should.eql('override');
        });

        it('Should fire the overridden handler from the alias', function() {
            var result = Graft.request('alias:second:task', 'second');
            result.should.eql('override:second');
        });

    });

});
