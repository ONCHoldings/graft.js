// test subsystem for requiring a system module directly , and having it register itself.
var Graft = require('../../../server');

Graft.system('DirectLoad', 'direct-load', {
    kind: 'direct_load'
});

require('./directload');

module.exports = 'success loading direct-load';
