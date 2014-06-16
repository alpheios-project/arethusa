"use strict";

describe("NavigatorCtrl", function() {
  var ctrl;
  var scope;
  var results;
  var mockNavigator = {
    nextSentence: function() {
      results.nextSentence = true;
    },
    prevSentence: function() {
      results.prevSentence = true;
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
});
