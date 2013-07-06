var express    = require('express');
var http       = require('http');
var Backbone   = require('backbone');
var Marionette = require('backbone.marionette');
var _          = require('underscore');

var slice = [].slice;

function Middleware(moduleName, app){
    this.moduleName = moduleName;
    this.submodules = {};

    this._setupInitializersAndFinalizers();

    this.startWithParent = true;
    // store the configuration for this module
    this.app     = app;
    var _express = express();
    this.express = _express;
    this.server  = http.createServer(this.express);

    this.locals = this.express.locals;
    this.triggerMethod = Marionette.triggerMethod;

    var expressMethods = ['all', 'get', 'post', 'delete', 'use', 'set', 'configure'];

    _.each(expressMethods, function(method) {
        this[method] = function() {
            var args = slice.call(arguments);
            return _express[method].apply(_express, args);
        };
    }, this);
};

Graft.Middleware = Middleware;

// Extend the Module prototype with events / listenTo, so that the module
// can be used as an event aggregator or pub/sub.
_.extend(Middleware.prototype, Marionette.Module.prototype);

Middleware.augment = Backbone.Router.augment;
Middleware.extend = Backbone.Router.extend;
Middleware.toString = function() {
    return '<Middleware ' + this.title + '>';
};


Marionette.Module.augment = Backbone.Router.augment;
Marionette.Module._getModule = function(parentModule, moduleName, app, def, args){
    // Get an existing module of this name if we have one
    var module = parentModule[moduleName];

    if (!module){
        // Create a new module if we don't have one
        if (parentModule.moduleName == 'Middleware') {
            module = new Graft.Middleware(moduleName, app);
        } else {
            module = new Marionette.Module(moduleName, app);
        }
        parentModule[moduleName] = module;
        // store the module on the parent
        parentModule.submodules[moduleName] = module;
    }

    return module;
};

module.exports = Graft.Middleware;

