[![Build Status](https://magnum.travis-ci.com/ONCHoldings/graft.js.png?token=b72mqMfgb1GT7zp1RCu1&branch=master)](https://magnum.travis-ci.com/ONCHoldings/graft.js)
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

__Builds off what you know__: When evaluating libraries and features to support, we try to pick more widely used and better maintained code bases.

__Explicit is better than implicit__: We try to stay away from declarative structures when trying to solve imperative problems.

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
