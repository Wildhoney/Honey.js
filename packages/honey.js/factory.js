/**
 * @module Honey
 * @class Factory
 */
Honey.Factory = {

    /**
     * @property _controllers
     * @type {Object}
     * @default {}
     * @private
     */
    _controllers: {},

    /**
     * @property _views
     * @type {Object}
     * @default {}
     * @private
     */
    _views: {},

    /**
     * @method getControllers
     * @return {Array}
     */
    getControllers: function() {
        return this._controllers;
    },

    /**
     * @method getViews
     * @return {Array}
     */
    getViews: function() {
        return this._views;
    },

    /**
     * @method getController
     * @param name
     * @return {Object}
     */
    getController: function(name) {
        return this._controllers[name];
    },

    /**
     * @method getView
     * @param name
     * @return {Object}
     */
    getView: function(name) {
        return this._views[name];
    },

    /**
     * @method createView
     * @param Object
     * @returns {Object.Class}
     */
    createView: function(Object) {

        var Class = Object.Class, name = Object.name, view, controller;

        view                        = new Class();
        view.name                   = name;
        view.toString               = function() {
            return '[view ' + name + ']';
        };
        this._views[Object.name]    = view;

        view.invokeConstructor();

        controller = Honey.Factory.getController(Honey.Utils.getControllerByView(name));

        if (controller) {
            controller._view    = view;
            view.controller     = controller;
        }

        return view;

    },

    /**
     * @method createController
     * @param Object
     * @return {Object.Class}
     */
    createController: function(Object) {

        var Class = Object.Class, name = Object.name, view, controller;

        controller              = new Class();
        controller.name         = name;
        controller.toString     = function() {
            return '[controller ' + name + ']';
        };
        this._controllers[name] = controller;

        controller.invokeConstructor();

        view = Honey.Factory.getView(Honey.Utils.getViewByController(name));

        if (view) {
            view.controller     = controller;
            controller._view    = view;
        }

        return controller;

    }

};