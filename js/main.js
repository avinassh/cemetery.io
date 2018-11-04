/* eslint-disable no-var, prefer-destructuring */

var app = angular.module('cApp', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/cemeteries.html',
    controller: 'gCtrl'
  }).when('/:username', {
    templateUrl: 'views/cemetery-custom.html',
    controller: 'cCtrl'
  }).otherwise({
    templateUrl: 'views/404.html'
  });
  $locationProvider.html5Mode(true);
});

app.controller('cCtrl', function($scope, $routeParams, $location, cemeteries) {
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
    if (cemetery) {
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

app.controller('gCtrl', function($scope, cemeteries) {
  $scope.shouldShow = false;

  $scope.graves = [];

  cemeteries.fetchCemeteries().then(function success() {
    $scope.graves = cemeteries.getAllCemeteries();
    $scope.shouldShow = true;
  }, function error() {
    alert('An error occured while fetching data');
  });
});

app.factory('cemeteries', function($http, $q) {
  var cemeteries = [];

  function fetchCemeteries() {
    var deferred = $q.defer();
    if (cemeteries.length) {
      deferred.resolve();
    }
    else {
      $http({
        method: 'GET',
        url: '/data/cemeteries.json'
      }).then(function success(response) {
        cemeteries = response.data.cemeteries;
        deferred.resolve();
      }, function error() {
        deferred.reject();
      });
    }
    return deferred.promise;
  }

  function getCemetery(username) {
    var i;
    for (i = 0; i < cemeteries.length; ++i) {
      if (cemeteries[i].username === username) return cemeteries[i];
    }
    return false;
  }

  function getAllCemeteries() {
    return cemeteries.map(function(c) {
      return {
        username: c.username,
        name: c.cemetery_data.name,
        yearsLived: c.cemetery_data.years_lived
      };
    });
  }

  return {
    getCemetery: getCemetery,
    getAllCemeteries: getAllCemeteries,
    fetchCemeteries: fetchCemeteries
  };
});

app.filter('toTrusted', function($sce){
  return function(text) {
    return $sce.trustAsHtml(text);
  };
});
