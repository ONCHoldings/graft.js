// Initialize the Graft application object.
var Graft = require('./graft');

// Register the index page to be delivered to the client.
Graft.get('/', function(req, res) {
    res.render('layout', {});
});

// Start the Application.
Graft.start();
