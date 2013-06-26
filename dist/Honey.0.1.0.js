/*! Honey by Adam Timberlake created on 2013-06-26 */
/**
 * @module Honey
 * @class Honey
 */
var Honey = {

    /**
     * @method create
     * @return {Honey.Application}
     */
    create: function() {
        return new Honey.Application();
    },

    /**
     * @method assert
     * @param description
     * @param assertion
     * @throw {Error}
     * @return {void}
     */
    assert: function(description, assertion) {
        if (!assertion) {
            throw new Error('Hey! ' + description + ', honey.');
        }
    },

    /**
     * @method Application
     * @return {Function}
     * @constructor
     */
    Application: function() {

        // Invoke the callback once the DOM has been loaded.
        return document.addEventListener('DOMContentLoaded', Honey.Bootstrap.bind(this), false);

    },

    /**
     * @method Bootstrap
     * @param [Application = []]
     * @return {Array}
     * @constructor
     */
    Bootstrap: function(Application) {

        var isTestEnvironment   = (Application instanceof Honey.Application),
            modules             = isTestEnvironment ? Application : this;

        /**
         * @method getType
         * @param name {String}
         * @return {String}
         */
        var getType = function(name) {
            return name.match(new RegExp(/([A-Z]{1}[a-z]+)$/g))[0].toLowerCase();
        };

        /**
         * @method createHierarchy
         * @param modules {Array}
         * @return {Array}
         */
        var createHierarchy = function(modules) {

            var collection = [], next;

            // Iterate over all of the items, such as controllers/views in the current application.
            for (var name in modules) {

                var item;

                if (!modules.hasOwnProperty(name)) {
                    // The usual suspect!
                    continue;
                }

                if (getType(name) !== 'view' || isTestEnvironment) {
                    // If the type of the current item isn't a view, then we can't find its location in the
                    // DOM. Most likely it's a controller, so we'll push those into the collection with zero
                    // ancestors, which should render them first.
                    collection.push({ Class: modules[name], name: name, ancestors: 0 });
                    continue;
                }

                // Discover the template name, then we can find the node, and grab all of its ancestors
                // using good ol' XPath.
                var templateName    = Honey.Utils.getTemplateName(name).toLowerCase(),
                    node            = document.querySelector('[data-template-name="' + templateName + '"]'),
                    xpath           = document.evaluate('ancestor::*', node),
                    count           = 0;

                do {
                    // Count how many ancestors this item has.
                    next = xpath.iterateNext();
                    count++;
                } while (next);

                // Add the object to the collection.
                item = { Class: modules[name], name: name, ancestors: count };
                collection.push(item);

            }

            // Sort the list of controllers/views by the amount of ancestors they have.
            return collection.sort(function(x, y){
                return (y.ancestors - x.ancestors);
            });

        };

        // Sort the views based on the count of their ancestors.
        var collection = createHierarchy(modules);

        // Iterate over all of the items in the collection.
        for (var item in collection) {

            if (!collection.hasOwnProperty(item)) {
                // Bonjour, hasOwnProperty!
                continue;
            }

            var module = collection[item];

            switch (getType(module.name)) {
                // Instantiate either a controller or a view depending on its type.
                case ('controller'): Honey.Factory.createController(module); break;
                case ('view'): Honey.Factory.createView(module); break;
            }
        }

        // Discover all of the views in the current application.
        var views = Honey.Factory.getViews();

        // Now that we've instantiated all of the controllers and views, we can begin rendering
        // the views into the DOM.
        for (var name in views) {

            if (!views.hasOwnProperty(name)) {
                // Wey hey!
                continue;
            }

            var instance        = Honey.Factory.getView(name);
            instance.renderable = true;
            instance.render();
        }

        // Voila!
        return collection;

    }

};
if (!window.Honey) {
    Honey = {};
}

/**
 * @module Honey
 * @class Collection
 */
Honey.Collection = {

    /**
     * @property modelMapper
     * @type {Object}
     * @default {}
     */
    modelMapper: {},

    /**
     * @method create
     * @param objects {Array}
     * @param collectionName {String}
     * @param controller {Object}
     * @return {Object}
     */
    create: function(objects, collectionName, controller) {

        var models = [];

        // Iterate over all of the objects in the array.
        objects.forEach(function forEach(object) {

            // Generate the unique ID for the model.
            var modelId = this.modelId();
            object.model = modelId;

            // Push each model into the mapper, and into the collection.
            this.modelMapper[modelId] = object;
            models.push(object);

        }, this);

        // Instantiate the collection, and push a few necessities onto it.
        var CollectionClass = this.getCollectionClass(models),
            collection      = new CollectionClass();

        collection._dimensions      = {};
        collection._crossfilter     = crossfilter(collection);
        collection._collectionClass = models;
        collection._controllerClass = controller;
        collection._collectionName  = collectionName;

        return collection;

    },

    /**
     * @method getCollectionClass
     * @param models
     * @returns {Function}
     */
    getCollectionClass: function(models) {

        function CollectionClass() {
            // Ugh!
            models.__proto__ = CollectionClass.prototype;
            return models;
        }

        // Add all of the custom prototypes on top of the `CollectionClass`.
        CollectionClass.prototype                   = [];
        CollectionClass.prototype.add               = Honey.Collection.Methods.add;
        CollectionClass.prototype.remove            = Honey.Collection.Methods.remove;
        CollectionClass.prototype.sort              = Honey.Collection.Methods.sort;
        CollectionClass.prototype.filter            = Honey.Collection.Methods.filter;
        CollectionClass.prototype.removeFilter      = Honey.Collection.Methods.removeFilter;
        CollectionClass.prototype.createDimension   = Honey.Collection.Methods.createDimension;
        CollectionClass.prototype._applyChanges     = Honey.Collection.Methods._applyChanges;

        return CollectionClass;

    },

    /**
     * @method modelId
     * Create the unique model ID.
     * @return {string}
     */
    modelId: function() {

        var identifier,
            firstIdentifier     = Math.round(Math.random() * 10000),
            secondIdentifier    = Math.round(Math.random() * 10000);

        do {
            // Generate the unique ID for the model's representation.
            identifier = [].concat(firstIdentifier, new Date().getTime(), secondIdentifier).join('-');
        } while (Honey.Collection.modelMapper[identifier]);

        return identifier;
    },

    Methods: {

        /**
         * @method add
         * @param object {Object}
         * @return {Object}
         */
        add: function(object) {

            // Generate the ID for the model's representation, and add set its property.
            var modelId     = Honey.Collection.modelId();
            object.model    = modelId;

            // Add it to the mapper, and into the collection!
            Honey.Collection.modelMapper[modelId] = object;
            this._collectionClass.push(object);

            // Re-render the view.
            this._controllerClass.view.render();
            return object;

        },

        /**
         * @method remove
         * @param model {Object}
         * @return {Object}
         */
        remove: function(model) {

            var collection = this._collectionClass;

            for (var index in collection) {

                if (!collection.hasOwnProperty(index)) {
                    // Here she is!
                    continue;
                }

                if (!collection[index].model) {
                    // We can't continue if we don't have a model attached.
                    continue;
                }

                if (collection[index].model !== model.model) {
                    // Don't continue if the model ID doesn't equal the one we're after.
                    continue;
                }

                // Otherwise we found the little blighter, and can safely remove him.
                collection.splice(index, 1);

            }

            this._controllerClass.view.render();
            return model;

        },

        /**
         * Creates a dimension if it doesn't already exist. Can also force the creation of
         * the new dimension by passed "true" to the third argument -- useful for when new
         * items are added to the collection.
         * @method createDimension
         * @param collection {Object}
         * @param property {String}
         * @param forceRecreation {Boolean}
         * @return {Boolean} whether the dimension creation process was a success or not.
         */
        createDimension: function(collection, property, forceRecreation) {

            var dimension = this._dimensions[property];

            if (dimension) {

                if (!forceRecreation) {
                    // If the dimension exists but we don't want to recreate it, then we can't
                    // do anything more.
                    return true;
                }

                // Delete the dimension so we can add it again.
                dimension.delete();

            }

            // Create the Crossfilter dimension on the property specified.
            this._dimensions[property] = this._crossfilter.dimension(function(d) {
                return d[property];
            });

            return true;

        },

        /**
         * @method filter
         * @param property {String}
         * @param filterMethod {Function}
         * @return {Object}
         */
        filter: function(property, filterMethod) {

            var collection  = this._collectionClass,
                controller  = this._controllerClass;

            // Create the dimension if it doesn't yet exist.
            collection.createDimension.apply(collection, [collection, property]);

            // Find the dimension we're dealing with.
            var dimension = collection._dimensions[property];

            dimension.filterFunction(function(dimension) {
                // Invoke the filter callback.
                return filterMethod.call(collection, dimension);
            });

            // Splice the new results into the collection, and finally render the view!
            var content = dimension.top(Infinity);
            this._applyChanges(content);
            controller.view.render();
            return content;

        },

        /**
         * @method removeFilter
         * @param property
         * Remove the filter based on the property name.
         * @return {Object}
         */
        removeFilter: function(property) {

            var collection  = this._collectionClass,
                controller  = this._controllerClass;

            // Find the dimension we're dealing with, and clear it.
            var dimension = collection._dimensions[property];
            dimension.filterAll();

            this._applyChanges(dimension.top(Infinity));
            controller.view.render();
            return dimension;

        },

        /**
         * @method sort
         * @param property {String}
         * @param isAscending {Boolean}
         * @return {Array}
         */
        sort: function(property, isAscending) {

            // Create the `sort` callback using the Crossfilter `quicksort`, and then sort the content
            // based on the parameters passed in.
            var collection  = this._collectionClass,
                controller  = this._controllerClass,
                sort        = crossfilter.quicksort.by(function(d) { return d[property]; }),
                content     = sort(collection, 0, collection.length);

            // If `isAscending` has not been specified, then we'll cycle through true/false depending
            // on the previous sort order.
            isAscending = (typeof isAscending !== 'undefined')  ? isAscending
                                                                : Honey.Utils.cycleProperty(collection._isAscending, [true, false]);

            // Configure the _isAscending property to keep a track of the sort direction.
            Object.defineProperty(collection, '_isAscending', {
                enumerable: false,
                configurable: true,
                value: isAscending
            });

            if (!isAscending) {
                // If we're sorting by descending then we need to reverse the array.
                content = content.reverse();
            }

            // Finally we can propagate the changes and re-render the view.
            this._applyChanges(content);
            controller.view.render();
            return content;

        },

        /**
         * @method _applyChanges
         * @param models {Array}
         * @return {void}
         * @private
         */
        _applyChanges: function(models) {

            // Splice the new results into the collection, and finally render the view!
            var args = [0, this._collectionClass.length].concat(models);
            Array.prototype.splice.apply(this._collectionClass, args);

        }

    }

};
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
        return this._controllers[Honey.Utils.getTemplateName(name)];
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
	
        // Push the view into the collection.
        this._views[name] = view;

        // Invoke the constructor method if it exists.
        view.invokeConstructor();

        // Find the controller.
        controller = Honey.Factory.getController(Honey.Utils.getControllerByView(name));

        // ...And setup the relationship if possible.
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

        // Push the controller into the collection.
        this._controllers[Honey.Utils.getTemplateName(name)] = controller;

        // Invoke the constructor method if it exists.
        controller.invokeConstructor();

        // Find the view.
        view = Honey.Factory.getView(Honey.Utils.getViewByController(name));

        // ...And setup the relationship if possible.
        if (view) {
            view.controller     = controller;
            controller._view    = view;
        }

        return controller;

    }

};
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
    },

    /**
     * @method format
     * @param string {String}
     * @param formats {Array}
     * @return {String}
     */
    format: function(string, formats) {

        var index = 0;

        return string.replace(/%@([0-9]+)?/g, function(formatString, argIndex) {

            argIndex        = (argIndex) ? parseInt(argIndex,0) - 1 : index++ ;
            formatString    = formats[argIndex];

            return ((formatString === null) ? '(null)' : (formatString === undefined) ? '' : formatString).toString();

        });

    }

};
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

            if (node) {

                // List of events to respond to.
                var events = ['click', 'dblclick', 'mouseover', 'mouseleave'];

                // Iterate over all of the desired events.
                events.forEach(function eventDelegate(eventName) {
                    node.addEventListener(eventName, function(event) {
                        delegate(eventName, event);
                    });
                });

            }

        },

        /**
         * @method render
         * Renders the view to the DOM.
         * @return {void}
         */
        render: function(template) {

            if (!this.renderable) {
                // If the view isn't in the correct state to be rendered to the DOM, then
                // there's not too much we can do at the moment.
                return;
            }

            // Find the template name, and then its associated SECTION node.
            var templateName    = Honey.Utils.getTemplateName(this.name),
                node            = document.querySelector('[data-template-name="' + templateName + '"]');

            if (!this.template && node) {

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
            var rendered    = Mustache.render(this.template || template, properties);
            Honey.View.templates[templateName + 'Template'] = rendered;

            if (!node) {
                // If we don't have a node then we're probably in test mode.
                return rendered;
            }

            // Otherwise we can render the HTML.
            node.innerHTML  = rendered;

        }

    }

};