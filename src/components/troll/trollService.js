var angular = require('angular');

//This is an example of a component for services.
//Just like any page component it defines an angular app.
//Because this is just a singular file component, we can skip the index.js and instead put it all in here
var app = angular.module('troll', []);

//We define the actual service here
app.factory('troll', function(){
	return {
		get : function(){
			return 'test get';
		}
	};
});

//Since this component does not contain any states, the export only contains a module as well
module.exports = {
  module : app
};
