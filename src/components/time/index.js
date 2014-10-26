var angular = require('angular');

//This is an example of a component for directives.
//Just like any page component it defines an angular app.
var app = angular.module('time', []);

//We define the actual directives here, because we don't have access to the app from the directive file.
//Moreover, defining them here gives a nice overview of what functionality this directive contains.
app.directive('time', require('./time'));

//Since this component does not contain any states, the export only contains a module as well
module.exports = {
  module : app
};


