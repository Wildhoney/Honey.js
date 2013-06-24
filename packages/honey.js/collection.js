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
     * @param controller {Object}
     * @return {Array}
     */
    create: function(objects, controller) {

        var collection = [], models = objects || [];

        collection.add = function add(object) {
            Honey.Collection.Methods.add.call(controller, object, this);
        };

        collection.remove = function remove(object) {
            Honey.Collection.Methods.remove.call(controller, object, this);
        };

        // Iterate over all of the objects in the array.
        models.forEach(function(object) {

            // Generate the unique ID for the model.
            var modelId = this.modelId();
            object.model = modelId;

            // Push each model into the mapper, and into the collection.
            this.modelMapper[modelId] = object;
            collection.push(object);

        }, this);

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

        }

    }

};