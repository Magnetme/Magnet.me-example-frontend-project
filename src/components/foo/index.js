var angular = require("angular");

//A component is always an angular module as well, such that dependencies
//can be defined per component.
//Each component requires it's own dependencies, and also defines its angular dependencies
//in its module constructor.
require("ui-bootstrap");
var app = angular.module("foo", ["ui.bootstrap"]);

module.exports = {
  //We export the module such that we can refer to that from our main config
  module : app,
  //Here we can define the states that this component defines.
  //It does not configure the state name or url, that's up to global config to define.
  states : {
    root : {
      templateUrl : __dirname + "/foo.html",
      controller : require("./fooCtrl")
    }
  }
};


