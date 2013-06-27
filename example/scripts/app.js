window.App = Honey.create();

App.ApplicationView = Honey.View.extend();
App.UsersView       = Honey.View.extend();
App.PlaylistView    = Honey.View.extend();

App.ApplicationController = Honey.Controller.extend({

    yourName: 'Adam',
    displayAffection: false,

    showLove: function() {
        this.displayAffection = true;
    },

    hideLove: function() {
        this.displayAffection = false;
    }

});

App.UsersController = Honey.Controller.extend({

    myName: 'Adam',
    users: [{ name: 'Boris', cuteness: 6 }, { name: 'Sergei', cuteness: 7 }, { name: 'Alisa', cuteness: 11 }],

    filterByCuteness: function() {
        this.users.filter('cuteness', function(dimension) {
            return dimension > 6
        });
    },

    clearCuteness: function() {
        this.users.removeFilter('cuteness');
    },

    setName: function() {
        this.myName = this.controllers.application.yourName = prompt('Then who are you?');
    },

    pokeSomebody: function(event, model) {
        alert('Ow! You poked, ' + model.name + '! How dare you?')
    }

});

App.PlaylistController = Honey.Controller.extend({

    artists: [{ name: 'Oasis' }, { name: 'Blur' }, { name: 'Otep' }],

    beginningWithO: function() {
        this.artists.filter('name', function(dimension) {
            return dimension.charAt(0) === 'O';
        });
    },

    removeArtist: function(event, model) {
        this.artists.remove(model);
    },

    addArtist: function() {
        this.artists.add({ name: prompt('Which artist do you love?') });
    }

});