var angular = require("angular");
require("ui-router");

//Here we require all page-components.
//We do not require any directives or external dependencies, since
//those should be required at the components that need them.
//This file should *only* requires the direct dependencies for this file.
var foo = require("components/foo");

var app =angular.module('app2', [
  'ui.router',
  //Each component exports an angular module, and these modules
  //have set a name property. This enables us to depend on modules
  //using actual properties instead of stringly typed names.
  foo.module.name
]);


app.config(function($urlRouterProvider, $stateProvider) {
  $urlRouterProvider.otherwise('/foo');

  $stateProvider
    //Similar as with the depency names we don't use controller names
    //or template urls directly here. Instead, the components
    //exports a state object that defines controllers and templates
    //for certain states. Here we just wire everything together
    .state('foo', {
      url : '/foo',
      controller : foo.states.root.controller,
      templateUrl : foo.states.root.templateUrl
    });
});

angular.bootstrap(document, ['app2']);
