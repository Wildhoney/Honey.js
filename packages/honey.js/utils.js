/**
 * @module Honey
 * @class Utils
 */
Honey.Utils = {

    /**
     * @method getControllerByView
     * @param name {String}
     * @returns {String}
     */
    getControllerByView: function(name) {
        return name.replace(/View/, 'Controller');
    },

    /**
     * @method getViewByController
     * @param name {String}
     * @returns {String}
     */
    getViewByController: function(name) {
        return name.replace(/Controller/, 'View');
    },

    /**
     * @method getTemplateName
     * @param name {String}
     * @returns {String}
     */
    getTemplateName: function(name) {
        return name.match(new RegExp(/^([A-Z]{1}[a-z]+)/g))[0].toLowerCase();
    },

    /**
     * @method getControllerByTemplateName
     * @param name {String}
     * @returns {String}
     */
    getControllerByTemplateName: function(name) {
        var capitalise = name.charAt(0).toUpperCase() + name.slice(1);
        return capitalise + 'Controller';
    }

};