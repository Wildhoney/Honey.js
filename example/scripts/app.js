window.App = Honey.create();

App.ApplicationView = Honey.View.extend();
App.UsersView       = Honey.View.extend();
App.PlaylistView    = Honey.View.extend();

App.ApplicationController = Honey.Controller.extend({

    yourName: 'Adam',
    displayAffection: false,

    /**
     * @method showLove
     * Invoked on any event from the template.
     */
    showLove: function() {
        this.displayAffection = true;
    },

    /**
     * @method hideLove
     * Invoked on any event from the template.
     */
    hideLove: function() {
        this.displayAffection = false;
    }

});

App.UsersCollection = Honey.Collection.extend();

App.UsersController = Honey.Controller.extend({

    myName: 'Adam',
    cutenessLevel: 6,
    users: App.UsersCollection.create([{ name: 'Boris', cuteness: 6 }, { name: 'Sergei', cuteness: 7 }, { name: 'Alisa', cuteness: 11 }]),

    /**
     * @method filterByCuteness
     * Applies a filter to the collection, where the context is the `UsersController`.
     * The name should be the name of the property you're wishing to filter on.
     * @return {void}
     */
    filterByCuteness: function() {
        this.users.addFilter('cuteness', function(dimension) {
            return dimension > this.cutenessLevel;
        });
    },

    /**
     * @method clearCuteness
     * Clear the filtering of the cuteness, which is based on the filter name you
     * supplied when creating the filter to begin with (`addFilter` above).
     * @return {void}
     */
    clearCuteness: function() {
        this.users.removeFilter('cuteness');
    },

    /**
     * @method setName
     * An example of how to change the name on the current controller, as well as propagating
     * the changes to the `ApplicationController` as well.
     * @return {void}
     */
    setName: function() {
        var applicationController = this.controllers.application;
        this.myName = applicationController.yourName = prompt('Then who are you?');
    },

    /**
     * @method pokeSomebody
     * @param event {Event}
     * @param model {Object}
     * Invoked from a client even from in the template.
     * @return {void}
     */
    pokeSomebody: function(event, model) {
        alert('Ow! You poked, ' + model.name + '! How dare you?')
    }

});

App.PlaylistController = Honey.Controller.extend({

    artists: [{ name: 'Oasis' }, { name: 'Blur' }, { name: 'Otep' }],

    /**
     * @method beginningWithO
     * Add a filter based on the name property of the artists collection.
     * Filters out those that don't begin with an "O".
     * @return {void}
     */
    beginningWithO: function() {
        this.artists.addFilter('name', function(dimension) {
            return dimension.charAt(0) === 'O';
        });
    },

    /**
     * @method removeArtist
     * @param event
     * @param model
     * Remove an artist from the collection based on its model.
     * @return {void}
     */
    removeArtist: function(event, model) {
        this.artists.removeItem(model);
    },

    /**
     * @method addArtist
     * Adds an artist to the collection based on a JavaScript prompt.
     * @return {void}
     */
    addArtist: function() {
        this.artists.addItem({ name: prompt('Which artist do you love?') });
    }

});