describe('Honey.js', function() {

    var App, testController;

    beforeEach(function() {
        App                 = Honey.create({ TEST_ENVIRONMENT: true });
        App.TestController  = Honey.Controller.extend({ russianLady: null, testSuite: 'Jasmine', beenTo: ['Estonia', 'Hong Kong', 'Brazil'], destination: null });
        App.TestView        = Honey.View.extend();

        testController      = Honey.Factory.getController('TestController');

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

});