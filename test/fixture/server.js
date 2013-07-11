var Graft = require('../../server');

require('../../middleware/Client.graft.js');
require('../../middleware/REST.graft.js');

Graft.load(__dirname);

Graft.get('/', function(req, res) {
    res.render('layout');
});

Graft.start();
