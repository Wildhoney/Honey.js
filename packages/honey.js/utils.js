/**
 * @module Honey
 * @class Utils
 */
Honey.Utils = {

    /**
     * @method getControllerByView
     * @param name {String}
     * @return {String}
     */
    getControllerByView: function(name) {
        return name.replace(/View/, 'Controller');
    },

    /**
     * @method getViewByController
     * @param name {String}
     * @return {String}
     */
    getViewByController: function(name) {
        return name.replace(/Controller/, 'View');
    },

    /**
     * @method getTemplateName
     * @param name {String}
     * @return {String}
     */
    getTemplateName: function(name) {
        return name.match(new RegExp(/^([A-Z]{1}[a-z]+)/g))[0].toLowerCase();
    },

    /**
     * @method getControllerByTemplateName
     * @param name {String}
     * @return {String}
     */
    getControllerByTemplateName: function(name) {
        var capitalise = name.charAt(0).toUpperCase() + name.slice(1);
        return capitalise + 'Controller';
    },

    /**
     * @method cycleProperty
     * @param value
     * @param possibleValues
     * @return {Number,String,Boolean}
     */
    cycleProperty: function(value, possibleValues) {
        var currentIndex = possibleValues.indexOf(value);
        if ((currentIndex + 1) >= possibleValues.length) {
            return possibleValues[0];
        }
        return possibleValues[currentIndex + 1];
    }

};