var utils    = require('./utils');
var should   = require('should');
var request  = require('request');
var async    = require('async');
var _        = require('underscore');
var log      = _.bind(console.log,console);
var testPort = 8902;

// Initialize the Graft application object.
var Graft    = require('../server');


describe('Testing Bundled Routes', function() {
    before(function() {
        // Load up the REST api middleware. (optional)
        require('../middleware/Client.graft.js');
        Graft.load(__dirname + '/fixture')
        Graft.start({ port: testPort });
    });

    describe('GET /js/templates.js', function() {
        before(utils.requestUrl(testPort, '/js/templates.js'));

        it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be javascript', function() {
            this.resp.should.have.header('content-type', 'text/javascript');
        });
        it ('should have a body', function() {
            should.exist(this.body);
        });
    });

    describe('GET /js/vendor.js', function() {
        before(utils.requestUrl(testPort, '/js/vendor.js'));

        it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be javascript', function() {
            this.resp.should.have.header('content-type', 'text/javascript');
        });
        it ('should have a body', function() {
            should.exist(this.body);
        });
    });


    describe.skip('GET /js/models.js', function() {
        before(utils.requestUrl(testPort, '/js/models.js'));

        it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be javascript', function() {
            this.resp.should.have.header('content-type', 'text/javascript');
        });
        it ('should have a body', function() {
            should.exist(this.body);
        });
    });

    describe.skip('GET /js/views.js', function() {
        before(utils.requestUrl(testPort, '/js/views.js'));

        it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be javascript', function() {
            this.resp.should.have.header('content-type', 'text/javascript');
        });
        it ('should have a body', function() {
            should.exist(this.body);
        });
    });

    describe.skip('GET /js/routers.js', function() {
        before(utils.requestUrl(testPort, '/js/routers.js'));

        it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be javascript', function() {
            this.resp.should.have.header('content-type', 'text/javascript');
        });
        it ('should have a body', function() {
            should.exist(this.body);
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
