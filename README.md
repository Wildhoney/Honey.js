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