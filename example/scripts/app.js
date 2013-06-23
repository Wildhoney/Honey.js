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
    users: [{ name: 'Boris' }, { name: 'Sergei' }, { name: 'Alisa' }],

    setName: function() {
        this.myName = prompt('Then who are you?');
    },

    pokeSomebody: function(model, event) {
        alert('You poked, ' + model.name + '! How dare you?')
    }

});

App.PlaylistController = Honey.Controller.extend({

    artists: [],

    removeArtist: function(model) {
        this.artists.remove(model);
    },

    addArtist: function() {
        this.artists.add({ name: prompt('Which artist do you love?') });
    }

});