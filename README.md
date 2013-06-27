Honey.js
=============

Honey.js is a **very** small JavaScript framework that attempts to use modern browser techniques. The default templating system is Mustache, and views are updated automatically.

The intention is to create a framework for others to learn JavaScript, and even use in their own small projects!


Philosophy
-------------

* Allows you to create a dynamic hierarchy;
* Doesn't drift far from native JavaScript methods;
* Controllers/views can be loaded in any order;
* Doesn't extend any prototypes, such as `Object`, `Function`, `String`, et cetera...;


Getting Started
-------------

The first thing you need to do is to create a Honey application:

    window.App = Honey.create();

Since Honey follows the <a href="http://en.wikipedia.org/wiki/Front_Controller_pattern" target="_blank">Front Controller pattern</a>, you'll need to set up an `ApplicationController` and `ApplicationView`:

    App.ApplicationView = Honey.View.extend();
    App.ApplicationController = Honey.Controller.extend();

You're then free to add as many controllers and views as you wish:

    App.UsersView = Honey.View.extend();
    App.UsersController = Honey.Controller.extend();

Controllers are responsible for pushing data to their corresponding view. For example, to push the `myName` property to the view, you need to first define it in the controller, and then you can assign data to it:

    App.UsersController = Honey.Controller.extend({
        myName: 'Masha',
        constructor: function() {
            this.myName = 'Adam';
        }
    });

Your template can then gather the data from the view:

    <section data-template-name="users">
        Hola, {{myName}}!
    </section>

However, you'll probably want to respond to events from the template, which will invoke a specific method on the controller:

    <section data-template-name="users">
        Hola, {{myName}}!
        <button data-click="changeName">I'm Adam!</button>
    </section>

You then need the `changeName` method in your `UsersController`:

    App.UsersController = Honey.Controller.extend({
        myName: 'Masha',
        changeName: function() {
            this.myName = 'Adam';
        }
    });

The template will then automatically update. Absolutely no properties are set in the controller, but are set *through* the controller, which then use `defineProperty` to update the view. The accessor method for each controller defined property retrieves it from the associated view.

The Honey framework also comes with collections (`Honey.Collection`) that allows you to add/remove objects, as well as filter them. `Honey.Collection`s when used with native JavaScript arrays **do not** update when an object's property value is changed &ndash; for that you'll need to use `Honey.Model`. Nevertheless, to begin you can create a collection by defining it in the controller:

    App.PetsController = Honey.Controller.extend({
        cats: [{ name: 'HoneyBoo' }, { name: 'Honeypot' }, { name: 'Honeydew }]
    });

Honey will automatically convert defined arrays (`[]`) into the type `Honey.Collection`. Honey.js does **NOT** extend common prototypes. Some of the methods that `Honey.Collection` adds on top of native array methods:

    * `add` &ndash; add a new object to the collection &ndash; adding a new item will also update the Crossfilter;
    * `remove` &ndash; remove an object from the collection by the model (`{{model}}`);
    * `filter` &ndash; filter the collection using <a href="http://square.github.io/crossfilter/" target="_blank">Crossfilter</a> &ndash; takes the `property` name as well as the callback method to filter the dimension;
    * `removeFilter` &ndash; remove a filter based on the `property` name;
    * `sort` &ndash; sort the collection by the `property`, and optional `isAscending` &ndash; if `isAscending` is not specified then each subsequent call will invert the sort order;

Therefore to add a filter to the `cats` collection:

    this.cats.filter('name', function(dimension) {
        return (dimension === 'HoneyBoo');
    });

Will leave us with just `HoneyBoo`. In order to remove the filter we can invoke `removeFilter`:

    this.cats.removeFilter('name');

Quick Tutorial
-------------

* Controllers should contain methods;
* Controllers define the properties which appear in the template;
* Controllers should push data to the views (`this.myName = 'Adam';`);
* Views should store the properties to update the templates;
* Templates should specify the events to respond to (`data-click="method"`);


Future
---

* Crossfilter for fast and automatic filtering of models;
* Promise pattern implementation;
* Mediator for communicating between controllers;