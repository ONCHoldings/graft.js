var should   = require('should');
var path     = require('path');
var _        = require('underscore');
var Graft    = require('../server');
var utils    = require('./utils');
var sinon       = require('sinon');
var testPort = 8924;

function setupSpies() {
    sinon.spy(Graft.Server, 'trigger');
}

function restoreSpies() {
    Graft.Server.trigger.restore();
}

describe('Systems: Running', function() {
    before(setupSpies);

    before(function() {
        Graft.system('ServerOnly', 'server-only', {
            kind: 'server_only'
        });
        Graft.system('ClientToo', 'client-too', {
            kind: 'client_too'
        });

        require('./fixture/direct-load');
        Graft.load(__dirname + '/fixture');

        Graft.start({ port: testPort });
    });

    it('should have all systems and submodules present', function() {
        Graft.should.have.property('DirectLoad');
        Graft.should.have.property('ServerOnly');
        Graft.ServerOnly.should.have.property('SubModule');
        Graft.should.have.property('ClientToo');
        Graft.ClientToo.should.have.property('SubModule');
    });

    it('should have called all the mount triggers', function() {
        sinon.assert.calledWith(Graft.Server.trigger, 'mount:server');
        sinon.assert.calledWith(Graft.Server.trigger, 'before:mount:server');
        sinon.assert.calledWith(Graft.Server.trigger, 'after:mount:server');

        sinon.assert.calledWith(Graft.Server.trigger, 'mount:static');
        sinon.assert.calledWith(Graft.Server.trigger, 'before:mount:static');
        sinon.assert.calledWith(Graft.Server.trigger, 'after:mount:static');

        sinon.assert.calledWith(Graft.Server.trigger, 'listen');
        sinon.assert.calledWith(Graft.Server.trigger, 'before:listen');
        sinon.assert.calledWith(Graft.Server.trigger, 'after:listen');
    });
    after(restoreSpies);
    describe('stop server', utils.stopServer);
});
