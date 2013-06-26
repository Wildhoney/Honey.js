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