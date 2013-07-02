/**
 * @module Honey
 * @class Model
 */
Honey.Model = {

    extend: function(properties) {

        var defineProperty = function(name, value) {
            Object.defineProperty(this, name, {
                value: value
            });
        };

        function ModelClass() {

            for (var propertyName in properties) {
                defineProperty(propertyName, properties[propertyName]);
            }

        }

        ModelClass.prototype = Honey.Controller.Methods;
        return ModelClass;

    },

    Attr: function() {

    },

    Methods: {

            
    }

};