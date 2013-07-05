var Graft = require('./graft');

Graft.get('/', function(req, res) {
    res.render('layout', {});
});

Graft.start();
