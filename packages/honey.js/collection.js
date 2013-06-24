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
     * @return {Collection}
     */
    create: function(objects, collectionName, controller) {

        var models = [];

        // Iterate over all of the objects in the array.
        objects.forEach(function(object) {

            // Generate the unique ID for the model.
            var modelId = this.modelId();
            object.model = modelId;

            // Push each model into the mapper, and into the collection.
            this.modelMapper[modelId] = object;
            models.push(object);

        }, this);

        function CollectionClass() {

            // Ugh!
            models.__proto__ = CollectionClass.prototype;
            return models;

        }

        // Add all of the custom prototypes on top of the `CollectionClass`.
        CollectionClass.prototype                   = [];
        CollectionClass.prototype.add               = Honey.Collection.Methods.add;
        CollectionClass.prototype.remove            = Honey.Collection.Methods.remove;
        CollectionClass.prototype.filter            = Honey.Collection.Methods.filter;
        CollectionClass.prototype.removeFilter      = Honey.Collection.Methods.removeFilter;
        CollectionClass.prototype.createDimension   = Honey.Collection.Methods.createDimension;
        CollectionClass.prototype._applyChanges     = Honey.Collection.Methods._applyChanges;

        // Instantiate the collection, and push a few necessities onto it.
        var collection = new CollectionClass();

        collection._dimensions      = {};
        collection._crossfilter     = crossfilter(collection);
        collection._collectionClass = models;
        collection._controllerClass = controller;
        collection._collectionName  = collectionName;

        return collection;

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
         * @retirm {void}
         */
        add: function(object) {

            // Generate the ID for the model's representation, and add set its property.
            var modelId     = Honey.Collection.modelId();
            object.model    = modelId;

            // Add it to the mapper, and into the collection!
            Honey.Collection.modelMapper[modelId] = object;
            this._collectionClass.push(object);

            this._controllerClass.view.render();

        },

        /**
         * @method remove
         * @param model {Object}
         * @return {void}
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
         * @return {void}
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
            this._applyChanges(dimension);
            controller.view.render();

        },

        /**
         * @method removeFilter
         * @param property
         * Remove the filter based on the property name.
         * @return {void}
         */
        removeFilter: function(property) {

            var collection  = this._collectionClass,
                controller  = this._controllerClass;

            // Find the dimension we're dealing with, and clear it.
            var dimension = collection._dimensions[property];
            dimension.filterAll();

            this._applyChanges(dimension);
            controller.view.render();

        },

        /**
         * @method _applyChanges
         * @param dimension
         * Apply changes based on a given dimension.
         * @return {void}
         * @private
         */
        _applyChanges: function(dimension) {

            // Splice the new results into the collection, and finally render the view!
            var args = [0, this._collectionClass.length].concat(dimension.top(Infinity));
            Array.prototype.splice.apply(this._collectionClass, args);

        }

    }

};