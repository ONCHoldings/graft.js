/**
 * Helper functions for testing REST requests.
 *
 * The resulting test code is significantly easier
 * to understand with these abstracted out.
 */
var should  = require('should');
var request = require('request');
var Couch = require('../node_modules/graft-couch/lib/couch.js');
var _ = require('underscore');
var fs = require('fs');

var testUrl = 'http://localhost:';
function parseBody() {
    try {
        this.body = JSON.parse(this.body);
    } catch (e) {
        should.fail(null, null, 'not valid json');
    }
}

function requestUrl(port, pathname, method, body) {
    return function(done) {
        var self = this;
        var opts = {};
        opts.method = method || 'GET';

        opts.json = body || true;

        request(testUrl + port + pathname, opts, function(err, resp, body) {
            self.resp = resp;
            self.body = body;
            done(err);
        });
    };
}

// Set up database, populate with design documents.
var install = function(config, options, callback) {
    var db = new Couch(config);
    if (_(options).isFunction()) {
        callback = options;
        options = {};
    }
    options = _(options || {}).defaults({
        doc: __dirname + '/fixture/resources/backbone.json'
    });

    //insert accounts
    var accounts = __dirname + '/fixture/resources/Account.json';
    fs.readFile(accounts, 'utf8', function(err, data) {
        if (err) return callback(err);
        accounts =  JSON.parse(data);
        _.each(accounts, function (account) {
            account._id = '/api/Account/' + account.id;
            db.put(account);
        });
    });

    //insert groups
    var groups = __dirname + '/fixture/resources/Group.json';
    fs.readFile(groups, 'utf8', function(err, data) {
        if (err) return callback(err);
        groups =  JSON.parse(data);
        _.each(groups, function (group) {
            group._id = '/api/Group/' + group.id;
            db.put(group);
        });
    });

    db.dbPut(function(err) {
        if (err) return callback(err);
        db.putDesignDocs([options.doc], callback);
    });
};

module.exports = {
    parseBody: parseBody,
    requestUrl: requestUrl,
    install: install
};
