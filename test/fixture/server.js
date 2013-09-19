var Graft = require('../../server');

require('../../server/client');
require('../../io/rest');

Graft.load(__dirname);

Graft.get('/', function(req, res) {
    res.render('layout');
});

Graft.start({locals: {}});
