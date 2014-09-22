"use strict";

describe("NavigatorCtrl", function() {
  var ctrl;
  var scope;
  var results;
  var mockNavigator = {
    nextChunk: function() {
      results.nextChunk = true;
    },
    prevChunk: function() {
      results.prevChunk = true;
    },
    goToFirst: function() {
      results.goToFirst = true;
    },
    goToLast: function() {
      results.goToLast = true;
    },
    goTo: function(id) {
      results.goTo = id;
    },
    status: 'status'
  };

  beforeEach(module("arethusa.core"));
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope;
    ctrl = $controller('NavigatorCtrl', {
      $scope: scope,
      navigator: mockNavigator
    });
    results = {};
  }));

  describe('next()', function() {
    it('delegates to navigator.nextChunk()', function() {
      scope.next();
      expect(results.nextChunk).toBeTruthy();
    });
  });

  describe('prev()', function() {
    it('delegates to navigator.prevChunk()', function() {
      scope.prev();
      expect(results.prevChunk).toBeTruthy();
    });
  });

  describe('goToFirst()', function() {
    it('delegats to navigator.goToFirst()', function() {
      scope.goToFirst();
      expect(results.goToFirst).toBeTruthy();
    });
  });

  describe('goToLast()', function() {
    it('delegats to navigator.goToLast()', function() {
      scope.goToLast();
      expect(results.goToLast).toBeTruthy();
    });
  });

  describe('goTo()', function() {
    it('delegats to navigator.goTo()', function() {
      scope.goTo('123');
      expect(results.goTo).toEqual('123');
    });
  });

  describe('navStat', function() {
    it('delegates to navigator.status and watches it', function() {
      scope.$apply();
      expect(scope.navStat).toEqual('status');
    });
  });
});
