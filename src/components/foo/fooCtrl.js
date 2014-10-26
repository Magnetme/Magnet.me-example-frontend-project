// Since we don't use angular.{controller,service,...} syntax ngAnnotate
// cannot properly determine by itself which functions it needs to annotate.
// Therefore we need to pass all functions that requires DI from angular to the global ngInject function
//

module.exports = ngInject(function fooController($scope) {
  $scope.msg = "Hello from fooController!";
});
