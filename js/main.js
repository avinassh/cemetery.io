var app = angular.module('cApp', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
      templateUrl : 'views/cemetery.html'
    })
    .when('/:username', {
        templateUrl : 'views/cemetery-custom.html',
        controller: 'cCtrl'
    })
    .otherwise({
        templateUrl: 'views/404.html'
    });
    $locationProvider.html5Mode(true);
});

app.controller('cCtrl', function($scope, $routeParams,$location, cemeteries) {
  var username = $routeParams.username.toLowerCase();
  
  $scope.shouldShow = false;
  $scope.fourOFour = false;

  $scope.userData = {
    name: '',
    yearsLived: '',
    description: ''
  };
  
  cemeteries.fetchCemeteries().then(function success() {
    var cemetery = cemeteries.getCemetery(username);
    if(cemetery) {
      $scope.userData = {
        name: cemetery.cemetery_data.name,
        yearsLived: cemetery.cemetery_data.years_lived,
        description: cemetery.cemetery_data.description
      };
      $scope.shouldShow = true;
    }
    else {
      $scope.fourOFour = true;
    }
  }, function error() {
    alert('An error occured while fetching data');
  });

});

app.factory('cemeteries', function($http, $q) {
  var cemeteries = [];
  
  function fetchCemeteries(data) {
    var deferred = $q.defer();
    if(cemeteries.length) {
      deferred.resolve(); 
    }
    else {
      $http({
        method: 'GET',
        url: '/data/cemeteries.json'
      }).then(function success(response) {
        cemeteries = response.data.cemeteries;
        deferred.resolve();
      }, function error(response) {
        deferred.reject();
      }); 
    }
    return deferred.promise;
  }

  function getCemetery(username) {
    for (var i = 0; i < cemeteries.length; ++i) {
      if(cemeteries[i].username == username)
        return cemeteries[i];
    }
    return false;
  }

  return {
    getCemetery: getCemetery,
    fetchCemeteries: fetchCemeteries
  };
});

app.filter('toTrusted', function($sce){
  return function(text) {
      return $sce.trustAsHtml(text);
  };
});