var should   = require('should');
var path     = require('path');
var _        = require('underscore');
var Graft    = require('../server');
var utils    = require('./utils');
var testPort = 8924;


describe('Systems: Running', function() {
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

    describe('Bundled code availability', function() {


    });
    describe('stop server', utils.stopServer);
});
