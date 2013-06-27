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

            var dimension;

            // Generate the ID for the model's representation, and add set its property.
            var modelId     = Honey.Collection.modelId();
            object.model    = modelId;

            // Add it to the mapper, and into the collection!
            Honey.Collection.modelMapper[modelId] = object;
            this._collectionClass.push(object);
            this._crossfilter.add([object]);

            // Store the first dimension we come across.
            for (var name in this._dimensions) {
                if (!this._dimensions.hasOwnProperty(name) || dimension) {
                    // Aha!
                    continue;
                }
                dimension = this._dimensions[name];
            }

            if (dimension) {
                // If we have a dimension then we can apply the changes from it.
                this._applyChanges(dimension.crossfilter.top(Infinity));
            }

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
        createDimension: function(collection, property, forceRecreation, filterMethod) {

            var dimension = this._dimensions[property];

            if (dimension) {

                if (!forceRecreation) {
                    // If the dimension exists but we don't want to recreate it, then we can't
                    // do anything more.
                    return true;
                }

                // Delete the dimension so we can add it again.
                dimension.crossfilter.remove();

            }

//            console.log(collection.length);

            // Create the Crossfilter dimension on the property specified.
            this._dimensions[property] = {
                method      : filterMethod,
                crossfilter : this._crossfilter.dimension(function(d) {
                    return d[property];
                })
            };

            return this._dimensions[property];

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
            collection.createDimension.apply(collection, [collection, property, true, filterMethod]);

            // Find the dimension we're dealing with.
            var dimension = collection._dimensions[property];

            dimension.crossfilter.filterFunction(function(dimension) {
                // Invoke the filter callback.
                return filterMethod.call(collection, dimension);
            });

            // Splice the new results into the collection, and finally render the view!
            var content = dimension.crossfilter.top(Infinity);
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
            var dimension = collection._dimensions[property].crossfilter;

            if (!dimension) {
                // We can't clear the filter if the dimension doesn't exist,
                // as it means we're not filtering on it.
                return;
            }

            // Clear the filter!
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