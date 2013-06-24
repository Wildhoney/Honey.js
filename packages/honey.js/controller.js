/**
 * @module Honey
 * @class Controller
 */
Honey.Controller = {

    /**
     * Extends the controller.
     * @param properties {Object}
     * @return {Object}
     */
    extend: function(properties) {

        var ControllerClass = function ControllerClass() {

            var controller  = this;
            this.buffer     = {};

            var propagateChanges = function propagateChanges(value) {
                // Pushes the property into the view.
                controller.propagateChanges.call(controller, this, value);
            };

            var retrieveChanges = function retrieveChanges() {

                if (!controller.view) {
                    //If the view doesn't exist yet then we'll attempt to get it from
                    // the buffer instead.
                    return controller.buffer[this];
                }

                // Takes the property from the view.
                return controller.view[this];

            };

            for (var property in properties) {

                if (!properties.hasOwnProperty(property)) {
                    // Yup! We didn't forget.
                    continue;
                }

                // We need to make a collection out of arrays.
                if (Array.isArray(properties[property])) {
                    properties[property] = Honey.Collection.create(properties[property], property, controller);
                }

                // Define the property on the controller so that when it changes, it is propagated
                // to the associated view, which will then render it in the template.
                Object.defineProperty(this, property, {

                    /**
                     * @method set
                     * @param value {String}
                     * Propagates all changes to the controller to the view.
                     */
                    set: propagateChanges.bind(property),

                    /**
                     * Finds the property on the corresponding view.
                     * @method get
                     * @return {String,Number,Object,Boolean}
                     */
                    get: retrieveChanges.bind(property)

                });

                // Finally we can set the property on the controller, knowing full well that
                // it will be propagated to the view for rendering.
                this[property] = properties[property];

            }

            // Special configuration for when the view property on the controller is changed, which means
            // the view has finally been attached.
            Object.defineProperty(this, '_view', {
                set: function set(value) {
                    controller.attachedView.call(controller, value);
                }
            });

        };

        ControllerClass.prototype               = Honey.Controller.Methods;
        ControllerClass.prototype.controllers   = Honey.Factory._controllers;

        return ControllerClass;

    },

    Methods: {

        /**
         * @method invokeConstructor
         * Invoke the constructor if it exists.
         * @return {param}
         */
        invokeConstructor: function() {
            if (typeof this.constructor === 'function') {
                // Invoke the controller's constructor if it exists.
                this.constructor();
            }
        },

        /**
         * @method propagateChanges
         * @param property {String}
         * @param value {String}
         * @return {Object}
         */
        propagateChanges: function(property, value) {

            if (!this.view) {
                // If we don't have a view associated with the controller yet, then we need
                // to drop the properties into the controller buffer. Once the view is available,
                // the buffer will be written, and then deleted from the object.
                this.buffer[property.valueOf()] = value;
                return this.buffer;
            }

            // However, if we do have a view -- which means it's most likely already present in the DOM,
            // then we can assign this property's value, and then re-render the view.
            this.view[property] = value;
            this.view.render();
            return this.view;

        },

        /**
         * @method attachedView
         * Invoked when the view is attached to the controller.
         * @return {void}
         */
        attachedView: function(view) {

            // Wire up the controller to the view.
            this.view = view;

            // Iterate over the buffer that may have been created to store properties/values that
            // were set before the view was available. In which case we need to grab them from the buffer,
            // drop them into the view, and then delete the buffer from the object, because once
            // we have created the relationship, the buffer is obsolete.
            for (var property in this.buffer) {

                if (!this.buffer.hasOwnProperty(property)) {
                    // Usual suspect!
                    continue;
                }

                // Drop the property and its value into the controller -- which will in turn be pushed
                // into the view.
                this[property] = this.buffer[property];

            }

            // The buffer has now become obsolete, so let's get rid of it.
            delete this.buffer;

        }

    }

};