// Initialize the Graft application object.
var Graft = require('../../graft');

// A simple test data adaptor to debug the REST api.
var Stash = require('./middleware/Stash.graft.js');
require('./models/index.js');

Graft.on('reset:data', function() {
    Stash.testData.Account = require('./resources/Account.json');
    Stash.testData.Group = require('./resources/Group.json');
}, Stash);

Stash.on('before:start', function() {
    Graft.trigger('reset:data');
});
Graft.start({ port: 8900 });
module.exports = Graft;

