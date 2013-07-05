var _            = require('underscore');
var $ = global.$ = require('jquery');

Graft = global.Graft = require('./graft.shared');

require('./lib/modules');
require('./middleware');
require('./middleware/Server.graft.js');

_.extend(Graft, Graft.middleware.Server);

module.exports = App = Graft;
