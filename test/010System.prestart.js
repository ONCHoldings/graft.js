var utils    = require('./utils');
var should   = require('should');
var path     = require('path');
var sinon    = require('sinon');
var _        = require('underscore');
var Backbone = require('backbone');

// Initialize the Graft application object.
var Graft = require('../server');

describe('Subsystem', function() {
    it('Should have an accessible system function', function() {
        Graft.should.have.property('system');
    });
    it('Should have a populated systems hash', function() {
        Graft.systems.should.have.property('Server');
        Graft.systems.should.have.property('Data');
        Graft.systems.should.have.property('Model');
        Graft.systems.should.have.property('Template');
        Graft.systems.should.have.property('View');
        Graft.systems.should.have.property('Router');
        Graft.systems.should.have.property('Client');
    });
    it('Should have registered the systems correctly', function() {
        Graft.systems.Server.should.eql({
            "bundle": 'server',
            "transform": "wrap",
            "extension": ".graft.js",
            "name": "Server",
            "path": "server",
            "instances": false,
            "kind": "server",
            "directories": []
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
                'name', 'path', 'instances', 'path',
                'directories'
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



    describe('Stubbed Subsystem Loading', function() {
        function getSysDirs() {
            return _(Graft.systems).chain()
                .toArray()
                .pick('name', 'directories')
                .value();
        }

        before(function() {
            sinon.stub(Graft, "require");
            Graft.load(__dirname + '/fixture/');
            this.systemDirs = getSysDirs();
        });

        it('did not manipulate the actual system.directories', function() {
            this.systemDirs.should.eql(getSysDirs());
        });

        it('called the require method for each system', function() {
            Graft.require.callCount.should.eql(_(Graft.systems).size());
        });

        it('should not have looked for the as-of-yet unloaded client-too system', function() {
            _(Graft.require.args).pluck(1).should.not.include('client-too');
        });

        it('should have looked for the server-only system', function() {
            _(Graft.require.args).pluck(1).should.include('server-only');
        });

        after(function() {
            Graft.require.restore();
        });
    });

    describe('Actual Subsystem Loading', function() {
        before(function() {
            Graft.load(__dirname + '/fixture/');
        });

        it('should have initialized the ServerOnly module', function() {
            should.exist(Graft.module('ServerOnly'));
            should.exist(Graft.ServerOnly);
        });

        it('should consider the same named file as an extension of the main module', function() {
            Graft.ServerOnly.description.should.eql('Server Only Code');
            should.not.exist(Graft.ServerOnly.ServerOnly);
        });

        it('should have loaded up the submodule correctly', function() {
            should.exist(Graft.module('ServerOnly.SubModule'));
            should.exist(Graft.ServerOnly.SubModule);
        });
    });

    describe('Loading a subsystem directly', function() {
        before(function() {
            require('./fixture/direct-load');
        });
        it('Should have registered the subsystem', function() {
            Graft.systems.should.have.property('DirectLoad');
        });

        it('Should have initialized the module, from the require()', function() {
            should.exist(Graft.module('DirectLoad'));
            should.exist(Graft.DirectLoad);
        });

        it('should have actually loaded that file', function() {
            Graft.DirectLoad.description.should.eql('i was loaded directly');
        });
    });

    describe('Client Visible system', function() {
        before(function() {
            Graft.system('ClientToo', 'client-too', {
                bundle: 'clienttoo',
                kind: 'client_too',
                instances: '$client2s'
            });

            Graft.load(__dirname + '/fixture/');
        });

        it('should have initialized the main module without a file of the same name', function() {
            should.exist(Graft.module('ClientToo'));
            should.exist(Graft.ClientToo);
            Graft.ClientToo.should.not.have.property('description');
        });

        it('should have loaded up the submodule correctly', function() {
            should.exist(Graft.module('ClientToo.SubModule'));
            should.exist(Graft.ClientToo.SubModule);
            Graft.ClientToo.SubModule.description.should.eql('Clients Gets This Too');
        });

        it('should have the SubModule instances', function() {
            Graft.should.have.property('$client2s');
            Graft.$client2s.should.have.property('SubModule');

        });
        it('should be an actual object stored there, not just the module', function() {
            Graft.$client2s.SubModule.should.have.property('message', 'INCLUDED BY CLIENT VISIBLE SYSTEM');
        });
    });

    describe('Client-side code bundling', function() {
        it('has not tried to bundle the server only .js files.', function() {
            Graft.bundles.order.should.not.include(require.resolve('./fixture/lib/server.only.js'));
        });

        it('has not tried to bundle the server bundled .js file before the server has started.', function() {
            Graft.bundles.order.should.not.include(require.resolve('./fixture/lib/server.bundle.js'));
        });

        it('has not tried to bundle the client required .js file before the server has started.', function() {
            Graft.bundles.order.should.not.include(require.resolve('./fixture/lib/client.too.js'));
        });

    });
});
