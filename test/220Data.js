var should      = require('should');
var _           = require('underscore');
var sinon       = require('sinon');
var path        = require('path');
var utils       = require('./utils');
var Graft       = require('../server');
var fixturePath = __dirname + '/fixture';
var testPort    = 8903;

function resetSpies() {
    Graft.Data.request.reset();
    Graft.Data.execute.reset();
    Graft.Data.trigger.reset();

    Graft.Data.read.reset();
    Graft.Data.delete.reset();
    Graft.Data.update.reset();
    Graft.Data.create.reset();
    Graft.Data.query.reset();
}

function setupSpies() {
    sinon.spy(Graft.Data, 'request');
    sinon.spy(Graft.Data, 'execute');
    sinon.spy(Graft.Data, 'trigger');

    sinon.spy(Graft.Data, 'read');
    sinon.spy(Graft.Data, 'delete');
    sinon.spy(Graft.Data, 'update');
    sinon.spy(Graft.Data, 'create');
    sinon.spy(Graft.Data, 'query');
}

function restoreSpies() {
    Graft.Data.request.restore();
    Graft.Data.execute.restore();
    Graft.Data.trigger.restore();

    Graft.Data.read.restore();
    Graft.Data.delete.restore();
    Graft.Data.update.restore();
    Graft.Data.create.restore();
    Graft.Data.query.restore();
}

Graft.commands.setHandler('Data:setupTest', function(done) {
    // A simple test data adaptor to debug the REST api.
    Graft.directory(path.dirname(require.resolve('graft-mockdb')));
    var Mock = require('graft-mockdb/data/mock');


    Graft.load(fixturePath);

    Graft.on('reset:data', function() {
        Mock.testData.Account = require('./fixture/resources/account.json');
        Mock.testData.Group = require('./fixture/resources/group.json');
    }, Mock);

    Graft.trigger('reset:data');

    Graft.start({ port: testPort }).then(done);
});

describe('Data implementation', function() {
    before(function(done) {
        Graft.execute('Data:setupTest', done);
    });

    it('has all the necessary methods', function() {
        Graft.Data.should.have.property('read');
        Graft.Data.should.have.property('delete');
        Graft.Data.should.have.property('update');
        Graft.Data.should.have.property('create');
        Graft.Data.should.have.property('query');
    });
});

describe.skip('Read handlers', function() {
    before(function(done) {
        setupSpies();
        this.model = new Graft.$models.Account({id: 1});
        this.model.fetch().then(done.bind(null, null), function(){console.log(arguments); done(1); });
    });

    it('should have fired the read method', function() {
        sinon.assert.called(Graft.Data.read);
    });
    after(function() {
        resetSpies();
    });
});

describe('stop server', utils.stopServer);
