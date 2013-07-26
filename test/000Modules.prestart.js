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

// Small helper to make sure files are loaded in correct order.
function fileOrder(order, file1, file2) {
    var orig = path.resolve(__dirname + file1);
    var xtra = path.resolve(__dirname + file2);

    var oIndex = _(order).indexOf(orig);
    var xIndex = _(order).indexOf(xtra);

    oIndex.should.be.below(xIndex);
}

describe('Module system', function() {
    describe('Before Start', function() {
        describe('Underscore mixins', function() {
            it('_ should have Deferred', function() {
                should.exist(_.Deferred);
            });

            it('Should have a working Deferred', function(done) {
                var dfr = new _.Deferred();

                dfr.always(done);
                _.delay(dfr.resolve, 200);

            });

            it('_ should have String functions', function() {
                should.exist(_.sprintf);
            });

        });
        it('Should have initialized bundles', function() {
            Graft.should.have.property('bundles');
        });

        it('BaseModel should be equal to Backbone.Model', function() {
            Graft.BaseModel.should.eql(Backbone.Model);
        });
        it('Should have added server middleware to bundle', function() {
            Graft.bundles.middleware.should.have.property('Server');
        });

        it('Should have initialized server module into marionette', function() {
            Graft.Middleware.should.have.property('Server');
        });

        it('Should have server middleware first in order', function() {
            var file = path.resolve(__dirname + '/../middleware/Server.graft.js');
            Graft.bundles.order[0].should.equal(file);
        });

        it('Should not have initialized rest middleware', function() {
            Graft.bundles.middleware.should.not.have.property('Test');
        });

        it('Should not have initialized client middleware', function() {
            Graft.bundles.middleware.should.not.have.property('Client');
        });

        it('Should not have included any models', function() {
            Graft.$models.should.eql({});
        });

        it('Should not have included any views', function() {
            Graft.$views.should.eql({});
        });

        it('Should not have included any routers', function() {
            Graft.$routers.should.eql({});
        });

        it('Should have started the shared/vendor bundles', function() {
            Graft.bundles.vendor
                .should.have.property('async', 'async');

            Graft.bundles.vendor
                .should.have.property('jquery', 'jquery-browserify');

            Graft.bundles.vendor
                .should.have.property('backbone', 'backbone');

            Graft.bundles.shared
                .should.have.property('graftjs', global.__graftPath);

            Graft.bundles.shared
                .should.have.property('./lib/mixins.js', path.resolve(__dirname + '/../lib/mixins.js'));
        });


        describe('Including Test middleware', function() {

            before(function() {
                require('./fixture/middleware/Test.graft.js');
            });

            it('Should have been added to the bundle', function() {
                Graft.bundles.middleware.should.have.property('Test');
            });

            it('Should have been initialized into marionette', function() {
                Graft.Middleware.should.have.property('Test');
            });

            it('Should have the listening property defaulted to false', function() {
                Graft.Middleware.Test.listening = false;
            });
            it('Should not have mounted express routes yet', function() {
                Graft.Middleware.Test.express.routes.should.not.have.property('get');
            });

            it('Property on module is set to alpha', function() {
                Graft.Middleware.Test.greekLetter.should.eql('alpha');
            });

            describe('Including another middleware with the same name', function() {
                before(function() {
                    this.Test = require('./fixture/override/middleware/Test.graft.js');
                });

                it('Property should be set to beta', function() {
                    Graft.Middleware.Test.greekLetter.should.eql('beta');
                });

                it('Should have the right loadOrder', function() {
                    Graft.Middleware.Test.loadOrder.should.eql(['alpha', 'beta']);
                });

                it('Should have the bundle order correct', function() {
                    fileOrder(
                        Graft.bundles.order,
                        '/fixture/middleware/Test.graft.js',
                        '/fixture/override/middleware/Test.graft.js'
                    );
                });
            });
        });

        describe('Including a single model (Group)', function() {
            before(function() {
                this.Group = require('./fixture/models/Group.graft.js');
            });

            it('Graft.$models have the Group property', function() {
                Graft.$models.should.have.property('Group');
            });

            it('Graft.Model should have the Group module initialized', function() {
                Graft.Model.should.have.property('Group');
            });

            it('Export from require should match instance in Graft.$models', function() {
                Graft.$models.Group.should.eql(this.Group);
            });

            it('Graft.$models.Group should not equal Graft.Models.Group', function() {
                Graft.$models.Group.should.not.eql(Graft.Model.Group);
            });

            it('Graft.$models.Group should equal Graft.Model.Group.export', function() {
                Graft.$models.Group.should.not.eql(Graft.Model.Group.export);
            });

            it('Graft.module("Model.Group") matches Graft.Model.Group', function() {
                Graft.Model.Group.should.eql(Graft.module("Model.Group"));
            });
        });

        describe('Including a single model after changing BaseModel (Account)', function() {
            before(function() {
                Graft.BaseModel = TestBaseModel;
                require('./fixture/models/Account.graft.js');
                this.instance = new Graft.$models.Account({ id: 123 });
                this.gInstance = new Graft.$models.Group({ id: 'group' });
            });

            it('BaseModel should equal TestBaseModel now', function() {
                Graft.BaseModel.should.eql(TestBaseModel);
            });

            it('Instance should be instanceof TestBaseModel', function() {
                this.instance.should.be.an.instanceOf(Graft.BaseModel);
            });

            it('Instance should also be an instance of Backbone.Model', function() {
                this.instance.should.be.an.instanceOf(Backbone.Model);
            });

            it('Group Instance should not be a TestBaseModel', function() {
                this.gInstance.should.not.be.an.instanceOf(TestBaseModel);
            });

        });

        describe('Changing BaseModel does not change already included modules', function() {
            before(function() {
                Graft.BaseModel = Backbone.Model;
                this.instance = new Graft.$models.Account({ id: 123 });
            });
            it('BaseModel should equal Backbone.Model again', function() {
                Graft.BaseModel.should.eql(Backbone.Model);
            });

            it('Instance should be instanceof TestBaseModel', function() {
                this.instance.should.be.an.instanceOf(Graft.BaseModel);
            });

            it('Instance should also be an instance of Backbone.Model', function() {
                this.instance.should.be.an.instanceOf(Backbone.Model);
            });


        });

        describe('Using Graft.load() to require many modules', function() {
            before(function() {
                Graft.load(__dirname + '/fixture');
            });
            it('Should have include all the models', function() {
                Graft.Model.should.have.property('Groups');
                Graft.Model.should.have.property('Account');
                Graft.Model.should.have.property('Accounts');
            });

            it('Should have the bundle order correct', function() {
                fileOrder(
                    Graft.bundles.order,
                    '/fixture/models/Group.graft.js',
                    '/fixture/models/Accounts.graft.js'
                );
            });

            it('Should have included the client.js into the client bundle', function() {
                Graft.bundles.client.should.have.property('./client.js');
            });

        });

        describe('After start', function() {
            before(function() {
                Graft.start({ port: testPort });
            });
            it('Should have mounted express routes', function() {
                Graft.Middleware.Test.express.routes.should.have.property('get');
            });
            it('Should have the correct initOrder for test middleware', function() {
                Graft.Middleware.Test.initOrder.should.eql(['alpha', 'beta']);
            });
            it('Should have set the test middleware to listening', function() {
                Graft.Middleware.Test.listening.should.eql(true);
            });

            describe('Have working routes', function() {
                before(utils.requestUrl(testPort, '/test/mufassa'));

                it ('should return status 200', function() {
                    this.resp.should.have.status(200);
                });

                it ('should have a body', function() {
                    should.exist(this.body);
                });

                it('should match the route param', function() {
                    this.body.should.eql('Hello mufassa');
                });
            });

            describe('stop server', function() {
                before(function() {
                    Graft.stop();
                });
                it('should be not initialized', function() {
                    Graft.Middleware.Server._isInitialized.should.eql(false);
                });
            });
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


    });
});

