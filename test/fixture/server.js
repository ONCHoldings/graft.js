var Graft = require('../../server');

require('../../server/Client.graft.js');
require('../../io/Rest.graft.js');

Graft.load(__dirname);

Graft.get('/', function(req, res) {
    res.render('layout');
});

Graft.start();
