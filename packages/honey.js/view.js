/**
 * @module Honey
 * @class View
 */
Honey.View = {

    /**
     * @property templates
     * @type Object
     * @default {}
     * Hash of all templates.
     */
    templates: {},

    /**
     * Extends a view
     * @param properties {Object}
     * @return {Object}
     */
    extend: function(properties) {

        var ViewClass = function ViewClass() {

            for (var property in properties) {
                if (properties.hasOwnProperty(property)) {
                    this[property] = properties[property];
                }
            }

            this.renderable = false;

        };

        ViewClass.prototype = Honey.View.Methods;
        return ViewClass;

    },

    /**
     * @property Methods
     * @type {Object}
     * All methods relating to view instances.
     */
    Methods: {

        /**
         * @property template
         * @type {String}
         * Mustache template for the view.
         */
        template: null,

        /**
         * @method invokeConstructor
         * Invoke the constructor if it exists.
         * @return {param}
         */
        invokeConstructor: function() {
            if (typeof this.constructor === 'function') {
                // Invoke the view's constructor if it exists.
                this.constructor();
            }
        },

        /**
         * @method constructor
         * @constructor
         */
        constructor: function() {

            // Find the template's name, and its SECTION node.
            var templateName    = Honey.Utils.getTemplateName(this.name),
                node            = document.querySelector('[data-template-name="' + templateName + '"]');

            /**
             * @method delegateEvent
             * @param eventName {String}
             * @param event {Event}
             * @return {void}
             */
            var delegate = function delegateEvent(eventName, event) {

                // Extract the method and the model (if it exists) from the node's attribute.
                var method  = event.target.getAttribute('data-' + eventName),
                    model   = event.target.getAttribute('data-model') || null;

                if (!method) {
                    // If there is method specified then this node doesn't have the correct
                    // event handler.
                    return;
                }

                // Find the container (SECTION node) from the current child. We can then discover its controller
                // which will hopefully handle the event.
                var container       = document.evaluate('ancestor-or-self::section[@data-template-name]', event.target).iterateNext(),
                    templateName    = container.getAttribute('data-template-name'),
                    controllerName  = Honey.Utils.getControllerByTemplateName(templateName),
                    controller      = Honey.Factory.getController(controllerName);

                // Ensure that the event has been created on the controller.
                Honey.assert('You must specify the `' + method + '` event on the `' + controllerName + '`', !!controller[method]);

                // Finally we can invoke it, passing the model and the event to the method.
                controller[method].apply(controller, [event, Honey.Collection.modelMapper[model]]);

            };

            // List of events to respond to.
            var events = ['click', 'dblclick', 'mouseover', 'mouseleave'];

            // Iterate over all of the desired events.
            events.forEach(function eventDelegate(eventName) {
                node.addEventListener(eventName, function(event) {
                    delegate(eventName, event);
                });
            });

        },

        /**
         * @method render
         * Renders the view to the DOM.
         * @return {void}
         */
        render: function() {

            if (!this.renderable) {
                // If the view isn't in the correct state to be rendered to the DOM, then
                // there's not too much we can do at the moment.
                return;
            }

            // Find the template name, and then its associated SECTION node.
            var templateName    = Honey.Utils.getTemplateName(this.name),
                node            = document.querySelector('[data-template-name="' + templateName + '"]');

            if (!this.template) {

                // Find all of the SECTION nodes in the document.
                var xpath = document.evaluate('section', node), section, sections = [];

                do {
                    // Iterate over all of the SECTION nodes, and if it exists then add it
                    // into the `sections` array.
                    section = xpath.iterateNext();
                    if (section) { sections.push(section); }
                } while (section);

                sections.forEach(function forEach(section) {
                    // Iterate over the nodes we found and replace them with their name.
                    var name = section.getAttribute('data-template-name');
                    section.innerHTML = '{{{' + name + 'Template}}}';
                });

                // Finally we need to grab the content again.
                this.template = document.querySelector('[data-template-name="' + templateName+ '"]').innerHTML;

            }

            var properties  = this,
                templates   = Honey.View.templates;

            // Iterate over all of the templates, merging the object into the context ("this").
            for (var index in templates) {

                if (templates.hasOwnProperty(index)) {
                    // Once we've done all of these, Mustache should have a list of all of the properties.
                    // It should have the properties for the current context, as well as the template properties
                    // for rendering all of its children.
                    properties[index] = templates[index];
                }

            }

            Honey.assert('You must include `Mustache` to be able to render the views', !!window['Mustache']);

            // Render the templates using Mustache, drop it into the hash, and then finally render it to the DOM.
            var rendered    = Mustache.render(this.template, properties);
            Honey.View.templates[templateName + 'Template'] = rendered;
            node.innerHTML  = rendered;

        }

    }

};