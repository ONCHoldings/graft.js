// Initialize the Graft application object.
var Graft = require('../../graft');

// A simple test data adaptor to debug the REST api.
var Mock = require('graft-mockdb');
require('./models/index.js');

Graft.on('reset:data', function() {
    Mock.testData.Account = require('./resources/Account.json');
    Mock.testData.Group = require('./resources/Group.json');
}, Mock);

Mock.on('before:start', function() {
    Graft.trigger('reset:data');
});
Graft.start({ port: 8900 });
module.exports = Graft;

