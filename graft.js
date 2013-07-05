var _            = require('underscore');
var $ = global.$ = require('jquery');

Graft = global.Graft = require('./graft.shared');

require('./middleware');
require('./middleware/Server.graft.js');
require('./middleware/Client.graft.js');

_.extend(Graft, Graft.middleware.Core);

module.exports = App;
