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