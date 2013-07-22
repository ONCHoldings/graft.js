Graft.js
========

Graft is a new javascript 'framework' developed by ONC Holdings, aka [StudentEdge](http://getstudentedge.com).

It has a slightly different (and ancillary) approach from the other frameworks out there, in that it is trying to provide a standardised 'execution environment' between the server and the browser, to allow you to more easily deploy the same codebase on both platforms.

It tries to even out the differences between the two environments, and provide some helpful functionality to implement parts that are just different.

It's closest neighbour in the world of 'frameworks' would probably be [AirBnB's Rendr](https://github.com/airbnb/rendr), except that it doesn't assume you want to render anything on the server, or even anything at all.

Graft is actually directly descended from the little-known [Bones](https://github.com/developmentseed/bones) framework, written by [Development Seed](http://developmentseed.org). They are using Bones to build multi-platform desktop applications ([TileMill](http://tilemill.com/)) and even powers their map serving juggernaut of a map hosting service [MapBox](https://mapbox.com).

Features
========

__Render on the server or the client__ : Or both. Different projects have different needs.

__Seamless build automation__ : We make use of [browserify](http://browserify.org) and related middleware, to keep the entire packaging aspect as hands off as possible.

__Keep our assumptions out of your code base__ : We try our best to avoid requirements from your code.

__(almost) Everything is optional__: Most of it's functionality is turned off by default, and easily enabled.

__Builds off what you know__: When evaluating libraries and features to support, we try to pick more widely used and better maintained code bases.

__Explicit is better than implicit__: We try to stay away from declarative structures when trying to solve imperative problems.

Installation
============

__TODO__ (if/when we publish this, update here)

	npm install graftjs
    
Usage
=====

### Server Side

project/server.js:  

	var Graft = require('graftjs/server');
    
    // Load up the REST api middleware. (optional)
    require('graftjs/middleware/REST.graft.js');
    
    // Load up the Client side application bundling (optional)
    require('graftjs/middleware/Client.graft.js');
    
    // Will load up all models/themes/routers and bundle them
    Graft.load(__dirname);
    
    // Register the index page to be delivered to the client.
    Graft.get('/', function(req, res) { res.render('layout', {}); });
    
    // Start the Application.
    Graft.start({ port: 3000 });

---

### Your Application (on server and client)

models/Account.graft.js:

    module.exports = Backbone.Model.extend({
        urlRoot: '/api/Account', // provided by REST middleware
        defaults: { group: 'default' }
    });

views/Account.graft.js:
    
    module.exports = Backbone.Marionette.ItemView.extend({
        className: 'account',
    	modelEvents: { 'change': 'render' }, // render dynamically on change
        template: require('../templates/Caller.jade') // client-side require()
    });
    
templates/Account.jade:

	h5= id
      .group= group

---

### Client Side

project/client.js:

	// Automatically included if found by Graft.load()
    var Graft  = require('graftjs');
    var Backbone = require('backbone');
    
    //Backbone.js client side initialization.
    Graft.on('start', function(options) {
    	// set up page regions
    	this.addRegions({ 'main': '#main' });
        
    	// init the account model
    	this.$state.account = new Graft.$models.Account({ id: 'adrian' });
        
        // Initiate the fetch of the model
        this.$state.account.fetch();
        
        // Show a new view in the region.
    	this.main.show(new Graft.$views.Account({ model: this.$state.account });

		// Start pushState here, if we had a router.
	    // Backbone.history.start({pushState: true, root: "/"});
	}, Graft);
    
    // Start App
    Graft.start();

### Run tests

You must configure CouchDB to work with HTTPS in order to run tests.
See [this wiki page](http://wiki.apache.org/couchdb/How_to_enable_SSL)

    cd graftjs/
    make all

