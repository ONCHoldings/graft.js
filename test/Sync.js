/*jshint unused:false*/
var should   = require('should');
var _ = require('underscore');
var testPort = 8903;

// Initialize the Graft application object.
var Graft    = require('../server');

Graft.commands.setHandler('Sync:setupTest', function(done) {
    // A simple test data adaptor to debug the REST api.
    var Mock = require('graft-mockdb');

    Graft.load(__dirname + '/fixture');

    Graft.on('reset:data', function() {
        Mock.testData.Account = require('./fixture/resources/Account.json');
        Mock.testData.Group = require('./fixture/resources/Group.json');
    }, Mock);

    Graft.trigger('reset:data');

    Graft.start({ port: testPort });
    done();
});

describe('Backbone Sync implementation', function() {
    before(function(done) {
        Graft.execute('Sync:setupTest', done);
    });

    describe('Loading a model', function() {
        before(function(done) {
            var self = this;

            var next = _.after(2, done);

            function optArgs() {
                self.optArgs = _(arguments).toArray();
                next();
            }
            function thenArgs() {
                self.thenArgs = _(arguments).toArray();
                next();
            }

            this.account = new Graft.$models.Account({ id: "0" });

            this.account.fetch({ success: optArgs, error: optArgs })
                .then(thenArgs, thenArgs);

        });
        it('Should not make a difference how the args got to us', function() {
            this.thenArgs.should.eql(this.optArgs);
        });

    });
});


