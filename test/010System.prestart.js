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

    describe('Server Only subsystem', function() {
        function getInstances() {
            var match = function(v) { return (/^\$.*/).test(v); };

            return _(Graft.bundles).chain()
                .keys()
                .filter(match)
                .value();
        }

        before(function() {
            this.currentBundles = _(Graft.bundles).keys();
            this.currentInstances = getInstances();
            
            Graft.system('ServerOnly', 'server-only', {
                kind: 'server_only'
            });
        });

        it('has registered the ServerOnly system', function() {
            Graft.systems.should.have.property('ServerOnly');
        });
        it('has all the required system properties', function() {
            Graft.systems.ServerOnly.should.have.keys(
                'bundle', 'transform', 'extension',
                'name', 'path', 'instances', 'path'
            );
        });

        it('should have accepted the provded settings', function() {
            Graft.systems.ServerOnly.should.have.property('name', 'ServerOnly');
            Graft.systems.ServerOnly.should.have.property('path', 'server-only');
            Graft.systems.ServerOnly.should.have.property('kind', 'server_only');
        });
        it('should have used the correct defaults', function() {
            Graft.systems.ServerOnly.should.have.property('bundle', false);
            Graft.systems.ServerOnly.should.have.property('instances', false);
            Graft.systems.ServerOnly.should.have.property('transform', 'wrap');
            Graft.systems.ServerOnly.should.have.property('extension', '.graft.js');
        });
        it('should not have resulted in any extra bundles being created', function() {
            Graft.bundles.should.have.keys(this.currentBundles);
        });
        it('should not have set up for instances', function() {
            this.currentInstances.should.eql(getInstances());
        });
    });
});
