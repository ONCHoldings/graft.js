// Initialize the Graft application object.
var Graft = require('./graft');

// A simple test data adaptor to debug the REST api.
require('./middleware/Data.test.graft.js');

// Register the index page to be delivered to the client.
Graft.get('/', function(req, res) {
    res.render('layout', {});
});

// Start the Application.
Graft.start();
