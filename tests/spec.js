describe('Honey.js', function() {

    var App, testController, testView;

    beforeEach(function() {
        App                 = Honey.create({ TEST_ENVIRONMENT: true });
        App.TestController  = Honey.Controller.extend({ russianLady: null, testSuite: 'Jasmine', beenTo: ['Estonia', 'Hong Kong', 'Brazil'], destination: null });
        App.TestView        = Honey.View.extend({ viewOnly: 'Hola Amigo!' });

        testController      = Honey.Factory.getController('TestController');
        testView            = Honey.Factory.getView('TestView');

        Honey.Bootstrap(App);
    });

    describe('Honey.Controller', function() {

        describe('Constructor', function() {

            it('Can create a controller that is ready to be instantiated.', function() {
                expect(typeof App.TestController).toEqual('function');
            });

            it('Extends the `Honey.Controller.Methods` prototype.', function() {
                expect(typeof App.TestController.prototype).toEqual('object');
                expect(typeof App.TestController.prototype.invokeConstructor).toEqual('function');
                expect(typeof App.TestController.prototype.controllers).toEqual('object');
            });

            it ('Defines the `Methods` object which will be use as the prototype', function() {
                expect(Honey.Controller.Methods).toBeTruthy();
            });

        });

        describe('Instance', function() {

            it('Can instantiate the class constructor.', function() {
                expect(typeof testController).toEqual('object');
                expect(testController.name).toEqual('TestController');
            });

            it('Has access to the prototypes.', function() {
                expect(typeof testController.invokeConstructor).toEqual('function');
                expect(typeof testController.controllers).toEqual('object');
            });

            it ('Has access to its related view.', function() {
                expect(typeof testController.view).toEqual('object');
                expect(testController.view.name).toEqual('TestView');
            });

            it('Configures itself correctly by defining its own properties.', function() {
                expect(typeof testController.testSuite).toEqual('string');
                expect(testController.testSuite).toEqual('Jasmine');
            });

            it ('Transforms defined arrays into instances of `Honey.Collection`', function() {
                expect(typeof testController.beenTo).toEqual('object');
                expect(Array.isArray(testController.beenTo)).toBeTruthy();
                expect(testController.beenTo.length).toEqual(3);
                expect(testController.beenTo[1]).toEqual('Hong Kong');
            });

            it ('Can propagate changes to the corresponding view.', function() {
                testController.russianLady = 'Masha';
                var buffer = testController.propagateChanges('testSuite', 'Lovely Jasmine');
                expect(buffer.testSuite).toEqual('Lovely Jasmine');
                expect(testController.view.russianLady).toEqual('Masha');
            });

            it ('Can place properties into the buffer when the view does not exist.', function() {
                testController.view     = null;
                testController.buffer   = {};
                var buffer = testController.propagateChanges('myName', 'Adam');
                expect(buffer.myName).toEqual('Adam');
            });

            it ('Can move items from the buffer to the view.', function() {
                testController.view        = null;
                testController.buffer      = {};
                testController.destination = 'Maldives';
                testController._view       = Honey.Factory.getView('TestView');
                expect(testController.view.destination).toEqual('Maldives');
            });

            it ('Does not set a property that is undefined in the controller.', function() {
                testController.animals = 'Monkeys and Gorillas';
                expect(testController.view.animals).toBeFalsy();
            });

        });
        
    });

    describe('Honey.View', function() {

        describe('Constructor', function() {

            it('Can create a view that is ready to be instantiated.', function() {
                expect(typeof App.TestView).toEqual('function');
            });

            it('Extends the `Honey.View.Methods` prototype.', function() {
                expect(typeof App.TestView.prototype).toEqual('object');
                expect(typeof App.TestView.prototype.invokeConstructor).toEqual('function');
                expect(typeof App.TestView.prototype.template).toEqual('object');
            });

            it ('Defines the `Methods` object which will be use as the prototype', function() {
                expect(Honey.View.Methods).toBeTruthy();
            });

        });

        describe('Instance', function() {

            it('Can instantiate the class constructor.', function() {
                expect(typeof testView).toEqual('object');
                expect(testView.name).toEqual('TestView');
            });

            it('Has access to the prototypes.', function() {
                expect(typeof testView.invokeConstructor).toEqual('function');
                expect(typeof testView.template).toEqual('object');
            });

            it ('Has access to its related controller.', function() {
                expect(typeof testView.controller).toEqual('object');
                expect(testView.controller.name).toEqual('TestController');
            });

            it('Configures itself correctly by defining its own properties.', function() {
                expect(typeof testView.viewOnly).toEqual('string');
                expect(testView.viewOnly).toEqual('Hola Amigo!');
            });

            it ('Can render itself to the DOM.', function() {
                expect(typeof testView.render).toEqual('function');
                expect(testView.render('{{viewOnly}}')).toEqual('Hola Amigo!');
                testController.russianLady = 'Masha';
                expect(testView.render('{{russianLady}}')).toEqual('Masha');
            })

        });

    });

    describe('Honey.Collection', function() {

        describe('Constructor', function() {

            it('Can create a collection that is ready to be instantiated.', function() {
                expect(typeof testController.beenTo).toEqual('object');
                expect(testController.beenTo.length).toEqual(3);
            });

            it('Extends the `Honey.Collection.Methods` prototype.', function() {
                var CollectionClass = Honey.Collection.getCollectionClass([1,2,3]);
                expect(typeof CollectionClass.prototype).toEqual('object');
                expect(typeof CollectionClass.prototype.add).toEqual('function');
                expect(typeof CollectionClass.prototype.remove).toEqual('function');
                expect(typeof CollectionClass.prototype.filter).toEqual('function');
                expect(typeof CollectionClass.prototype.removeFilter).toEqual('function');
                expect(typeof CollectionClass.prototype.createDimension).toEqual('function');
                expect(typeof CollectionClass.prototype._applyChanges).toEqual('function');
            });

            it ('Defines the `Methods` object which will be use as the prototype.', function() {
                expect(Honey.Collection.Methods).toBeTruthy();
            });

            it ('Allows the assigning of IDs to their models.', function() {
                expect(Honey.Collection.modelId()).toBeTruthy();
                expect(Honey.Collection.create([{ name: 'Adam' }])[0].model).toBeTruthy();
            });

            it ('Sets up the named properties for dealing with a collection.', function() {
                var collection = Honey.Collection.create([1,2,3,4,5], 'exampleName', testController);
                expect(collection._collectionName).toEqual('exampleName');
                expect(typeof collection._collectionClass).toEqual('object');
                expect(typeof collection._controllerClass).toEqual('object');
            });

        });

        describe('Instance', function() {

            it ('Can create a collection based on an array.', function() {
                var collection = Honey.Collection.create([1,2,3]);
                expect(collection.length).toEqual(3);
            });

            it ('Is able to define Crossfilter dimensions on a given property', function() {
                var collection = Honey.Collection.create([{ moniker: 'Adam' }]);
                collection.createDimension(collection, 'moniker');
                expect(collection._dimensions['moniker']).toBeTruthy();
            });

            it ('Can filter the models based on a given callback method.', function() {
                var models      = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }],
                    collection  = Honey.Collection.create(models, 'models', Honey.Factory.getController('TestController'));
                expect(collection.length).toEqual(4);
                collection.filter('value', function(d) {
                    return (d % 2) === 0;
                });
                expect(collection.length).toEqual(2);
            });

            it ('Can clear any active filtering on the collection.', function() {
                var models      = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }],
                    collection  = Honey.Collection.create(models, 'models', Honey.Factory.getController('TestController'));
                collection.filter('value', function() { return false; });
                expect(collection.length).toEqual(0);
                collection.removeFilter('value');
                expect(collection.length).toEqual(4);
            });

        });

    });

});