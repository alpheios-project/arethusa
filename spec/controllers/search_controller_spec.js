"use strict";

describe('SearchController', function(){
  beforeEach(module('arethusa-core'));

  describe('search', function(){
    it('adds a parameter to the url', inject(function($controller, $location) {
      var scope = { query : "my query"};
      var ctrl = $controller('SearchController',
                             { $scope: scope, $location: $location});

      scope.search();

      expect($location.search()).toEqual({ input: scope.query});
    }));
  });
});

