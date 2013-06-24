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
     * @return {Array}
     */
    create: function(objects, collectionName, controller) {

        var collection = [], models = objects || [];

        collection.add = function add(object) {
            Honey.Collection.Methods.add.call(controller, object, this);
        };

        collection.remove = function remove(object) {
            Honey.Collection.Methods.remove.call(controller, object, this);
        };

        collection.createDimension = Honey.Collection.Methods.createDimension;

        // Iterate over all of the objects in the array.
        models.forEach(function(object) {

            // Generate the unique ID for the model.
            var modelId = this.modelId();
            object.model = modelId;

            // Push each model into the mapper, and into the collection.
            this.modelMapper[modelId] = object;
            collection.push(object);

        }, this);

        collection._crossfilter = crossfilter(collection);
        collection._dimensions  = {};
        collection.filterRange  = function filterRange(property, range) {
            Honey.Collection.Methods.filterRange.call(controller, collectionName, property, range, this);
        };

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
         * @param collection {Array}
         */
        add: function(object, collection) {

            // Generate the ID for the model's representation, and add set its property.
            var modelId     = Honey.Collection.modelId();
            object.model    = modelId;

            // Add it to the mapper, and into the collection!
            Honey.Collection.modelMapper[modelId] = object;
            collection.push(object);

            this.view.render();

        },

        /**
         * @method remove
         * @param object {Object}
         * @param collection {Array}
         */
        remove: function(object, collection) {

            for (var index in collection) {

                if (!collection.hasOwnProperty(index)) {
                    // Here she is!
                    continue;
                }

                if (collection[index].model !== object.model) {
                    // Don't continue if the model ID doesn't equal the one we're after.
                    continue;
                }

                // Otherwise we found the little blighter, and can safely remove him.
                collection.splice(index, 1);

            }

            this.view.render();

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

            if (dimension && forceRecreation) {
                // Delete the existing dimension and re-create it.
                dimension.delete();
            }

            this._dimensions[property] = this._crossfilter.dimension(function(d) {
                return d[property];
            });

            return true;

        },

        /**
         * @method filterRange
         * @param collectionName {String}
         * @param property {String}
         * @param range {Array}
         * @param collection {Object}
         * @return {void}
         */
        filterRange: function(collectionName, property, range, collection) {

            // Create the dimension if it doesn't yet exist.
            collection.createDimension.apply(collection, [collection, property]);

            var dimension = collection._dimensions[property];
            dimension.filterRange(range);
            this[collectionName] = dimension.top(Infinity);

        }

    }

};