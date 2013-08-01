[![Build Status](https://travis-ci.org/ONCHoldings/graft.js.png)](https://travis-ci.org/ONCHoldings/graft.js)

Graft.js
========

Graft is a new javascript 'framework' developed by ONC Holdings, aka [StudentEdge](http://getstudentedge.com).

It has a slightly different (and ancillary) approach from the other frameworks out there, in that it is trying to provide a standardised 'execution environment' between the server and the browser, to allow you to more easily deploy the same codebase on both platforms.

It tries to even out the differences between the two environments, and provide some helpful functionality to implement parts that are just different.

It's closest neighbour in the world of 'frameworks' would probably be [AirBnB's Rendr](https://github.com/airbnb/rendr), except that it doesn't assume you want to render anything on the server, or even anything at all.

Features
========

__Render on the server or the client__ : Or both. Different projects have different needs.

__Seamless build automation__ : We make use of [browserify](http://browserify.org) and related middleware, to keep the entire packaging aspect as hands off as possible.

__Keep our assumptions out of your code base__ : We try our best to avoid requirements from your code.

__(almost) Everything is optional__: Most of it's functionality is turned off by default, and easily enabled.

__Explicit is better than implicit__: We try to stay away from declarative structures when trying to solve imperative problems.

Sub-Projects
============

package | description | build status
---|---|---
[graft-example](https://github.com/ONCHoldings/graft-example)|Example project|[![Build Status](https://travis-ci.org/ONCHoldings/graft-example.png)](https://travis-ci.org/ONCHoldings/graft-example)
[graft-auth](https://github.com/ONCHoldings/graft-auth)|Pluggable authentication layer|[![Build Status](https://travis-ci.org/ONCHoldings/graft-auth.png)](https://travis-ci.org/ONCHoldings/graft-auth)
[graft-bootstrap](https://github.com/ONCHoldings/graft-bootstrap)|Twitter bootstrap integration via LESS|[![Build Status](https://travis-ci.org/ONCHoldings/graft-bootstrap.png)](https://travis-ci.org/ONCHoldings/graft-bootstrap)
[graft-couch](https://github.com/ONCHoldings/graft-couch)|CouchDB database adaptor|[![Build Status](https://travis-ci.org/ONCHoldings/graft-couch.png)](https://travis-ci.org/ONCHoldings/graft-couch)
[graft-mockdb](https://github.com/ONCHoldings/graft-mockdb)|Simple data layer to mock up data access for tests|[![Build Status](https://travis-ci.org/ONCHoldings/graft-mockdb.png)](https://travis-ci.org/ONCHoldings/graft-mockdb)
[graft-schema](https://github.com/ONCHoldings/graft-schema)|JSON Schema validation of models|[![Build Status](https://travis-ci.org/ONCHoldings/graft-schema.png)](https://travis-ci.org/ONCHoldings/graft-schema)

Installation
============

	npm install --save graftjs

Running
=======

    node server.js
    
Usage
=====

See [graft-example](https://github.com/ONCHoldings/graft-example) for a more complete example.

Run tests
=========

    npm test
