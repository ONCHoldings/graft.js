var utils         = require('./utils');
var should        = require('should');
var path          = require('path');
var _             = require('underscore');
var pwd           = process.cwd();
var Backbone      = require('backbone');
var fixturePath   = __dirname + '/fixture';
var Graft         = require('../server');
var TestBaseModel = Backbone.Model.extend({
    title: 'TestBaseModel'
});

// Initialize the Graft application object.

// Small helper to make sure files are loaded in correct order.
function fileOrder(order, file1, file2) {
    var orig = path.resolve(__dirname + file1);
    var xtra = path.resolve(__dirname + file2);

    var oIndex = _(order).indexOf(orig);
    var xIndex = _(order).indexOf(xtra);

    oIndex.should.be.below(xIndex);
}

describe('Modules: Before Start', function() {
    before(function() {
        process.chdir(fixturePath);
        Graft.directory(fixturePath);
    });

    it('Should have initialized bundles', function() {
        Graft.should.have.property('bundles');
    });

    it('BaseModel should be equal to Backbone.Model', function() {
        Graft.BaseModel.should.eql(Backbone.Model);
    });

    it('Should have added server server to bundle', function() {
        Graft.bundles.server.should.have.property('./server/server.js');
    });

    it('Should have initialized server module into marionette', function() {
        Graft.should.have.property('Server');
    });

    it('Should have server server first in order', function() {
        var file = path.resolve(__dirname + '/../server/server.js');
        Graft.bundles.order[0].should.equal(file);
    });

    it('Should not have initialized rest server', function() {
        Graft.bundles.server.should.not.have.property('Rest');
    });

    it('Should not have initialized client server', function() {
        Graft.bundles.server.should.not.have.property('Client');
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
            .should.have.property('./lib/mixins', path.resolve(__dirname + '/../lib/mixins'));
    });


    describe('Including Test server', function() {

        before(function() {
            require('./fixture/server/test.js');
        });

        it('Should have been added to the bundle', function() {
            Graft.bundles.server.should.have.property('./server/test.js');
        });

        it('Should have been initialized into marionette', function() {
            Graft.Server.should.have.property('Test');
        });

        it('Should have the listening property defaulted to false', function() {
            Graft.Server.Test.listening = false;
        });
        it('Should not have mounted express routes yet', function() {
            Graft.Server.Test.express.routes.should.not.have.property('get');
        });

        it('Property on module is set to alpha', function() {
            Graft.Server.Test.greekLetter.should.eql('alpha');
        });

        describe('Including another server with the same name', function() {
            before(function() {
                Graft.directory(__dirname + '/fixture/override');
                this.Test = require('./fixture/override/server/test.js');
            });

            it('Property should be set to beta', function() {
                Graft.Server.Test.greekLetter.should.eql('beta');
            });

            it('Should have the right loadOrder', function() {
                Graft.Server.Test.loadOrder.should.eql(['alpha', 'beta']);
            });

            it('Should have the bundle order correct', function() {
                fileOrder(
                    Graft.bundles.order,
                    '/fixture/server/test.js',
                    '/fixture/override/server/test.js'
                );
            });
        });
    });

    describe('Including a single model (Group)', function() {
        before(function() {
            this.Group = require('./fixture/models/group.js');
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
            require('./fixture/models/account.js');
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
            Graft.load(fixturePath);
        });
        it('Should have include all the models', function() {
            Graft.Model.should.have.property('Groups');
            Graft.Model.should.have.property('Account');
            Graft.Model.should.have.property('Accounts');
        });

        it('Should have the bundle order correct', function() {
            fileOrder(
                Graft.bundles.order,
                '/fixture/models/group.js',
                '/fixture/models/accounts.js'
            );
        });

        it('Should have included the client.js into the client bundle', function() {
            Graft.bundles.client.should.have.property('./client.js');
        });

    });
    after(function() { process.chdir(pwd); });
});
