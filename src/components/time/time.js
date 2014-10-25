// Just like controllers, we only export the directive function here.

module.exports = function() {
  return {
    restrict : 'E',
    templateUrl : __dirname + '/time.html',
    controller : ngInject(function($scope) {
      $scope.now = new Date().toString();
    })
  };
};

