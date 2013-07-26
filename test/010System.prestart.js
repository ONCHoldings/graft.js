var utils    = require('./utils');
var should   = require('should');
var path     = require('path');
var _        = require('underscore');
var Backbone = require('backbone');

var testPort = 8908;

// Initialize the Graft application object.
var Graft = require('../server');

describe('Subsystem', function() {
    it('Should have an accessible system function', function() {
        Graft.should.have.property('system');
    });
    it('Should have a populated systems hash', function() {
        Graft.systems.should.have.property('Middleware');
        Graft.systems.should.have.property('Data');
        Graft.systems.should.have.property('Model');
        Graft.systems.should.have.property('Template');
        Graft.systems.should.have.property('View');
        Graft.systems.should.have.property('Router');
        Graft.systems.should.have.property('Client');
    });
    it('Should have registered the systems correctly', function() {
        Graft.systems.Middleware.should.eql({
            "bundle": 'middleware',
            "transform": "wrap",
            "extension": ".graft.js",
            "name": "Middleware",
            "path": "middleware",
            "instances": false,
            "kind": "middleware"
        });
    });

    it('Test subsystems should not exist yet.', function() {
        Graft.systems.should.not.have.property('ServerOnly');
        Graft.systems.should.not.have.property('ClientToo');
    });

    describe('Registering Subsystems', function() {
        describe('Server Only subsystem', function() {
            before(function() {
                Graft.system('ServerOnly', 'server-only', {
                    kind: 'server_only',
                    path: 'server-only'
                });
            });

            it('has registered the ServerOnly system', function() {

            });


        });
    });
});
