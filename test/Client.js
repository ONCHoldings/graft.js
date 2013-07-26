var utils    = require('./utils');
var should   = require('should');
var path     = require('path');
var express  = require('express');
var connect  = require('connect');
var testPort = 8902;

// Initialize the Graft application object.
var Graft    = require('../server');


describe('Testing Bundled Routes', function() {
    before(function() {
        // Load up the REST api middleware. (optional)
        require('../middleware/Client.graft.js');
        Graft.load(__dirname + '/fixture');
        var locals = {
            siteName: "I'M BATMAN",
            title: "KAPOW"
        };

        Graft.start({ port: testPort, locals: locals });

        Graft.set('views', path.resolve(__dirname + '/fixture/templates'));

        Graft.get('/', function(req, res, next) {
            res.render('layout', {});
        });

    });
    describe('index page', function() {
        before(utils.requestUrl(testPort, '/'));

        it ('should return status 200', function() {
            this.resp.should.have.status(200);
        });
        it('response should be html', function() {
            this.resp.should.have.header('content-type', 'text/html; charset=utf-8');
        });
        it ('should have a body', function() {
            should.exist(this.body);
        });
        it('response should have the locals', function() {
            this.body.should.include('KAPOW');
            this.body.should.include("I'M BATMAN");
        });
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

    describe('GET /js/models.js', function() {
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

    describe('GET /js/views.js', function() {
        before(utils.requestUrl(testPort, '/js/views.js'));

        it('should return status 200', function() {
            this.resp.should.have.status(200);
        });

        it('response should be javascript', function() {
            this.resp.should.have.header('content-type', 'text/javascript');
        });
        it ('should have a body', function() {
            should.exist(this.body);
        });
    });

    describe('GET /js/routers.js', function() {
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

    describe('Static provider test', function() {
        before(function() {
            Graft.use('/css', express.static(__dirname + '/fixture/css'));
            Graft.use('/css', express.static(__dirname + '/fixture/assets/css'));
        });
        describe('should give me the master css when i request it', function(done) {
            before(utils.requestUrl(testPort, '/css/master.css'));

            it ('should return status 200', function() {
                this.resp.should.have.status(200);
            });

            it ('should have a body', function() {
                should.exist(this.body);
            });

            it('should be the right contents', function() {
                this.body.should.include('MASTER CSS FILE');
            });
        });
        describe('should give me the custom component css when i request it', function(done) {
            before(utils.requestUrl(testPort, '/css/component.css'));

            it ('should return status 200', function() {
                this.resp.should.have.status(200);
            });

            it ('should have a body', function() {
                should.exist(this.body);
            });

            it('should be the right contents', function() {
                this.body.should.include('CUSTOM COMPONENT CSS');
            });
        });
    });

    describe('stop server', utils.stopServer);
});
