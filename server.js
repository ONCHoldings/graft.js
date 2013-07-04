var _            = require('underscore');

var $ = global.$ = require('jquery');
var App = require('./shared');
Graft = global.Graft = App;

require('./server/modules.js');
require('./servers/Core.graft.js');

_.extend(Graft, Graft.servers.Core);

module.exports = App;
