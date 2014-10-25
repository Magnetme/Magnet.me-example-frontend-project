// Since we don't use angular.{controller,service,...} syntax ngAnnotate
// cannot properly determine by itself which functions it needs to annotate.
// Therefore we need to pass all functions that requires DI from angular to ngInject
// As a small sidenote: I named the function here for ease of debugging. It's not a hard requirement, but it makes things easier!

module.exports = ngInject(function barController($scope) {
  $scope.msg = "Hello from barController!";
});
