"use strict";

describe('nextToken', function() {
  var element;
  var results;
  var mockState = {
    selectNextToken: function() {
      results.nextToken = true;
    }
  };

  beforeEach(module('arethusa.core', function($provide) {
    $provide.value('state', mockState);
  }));

  beforeEach(inject(function($compile, $rootScope) {
    element = angular.element('<span next-token/>');
    $compile(element)($rootScope);
    results = {};
  }));

  describe('on click', function() {
    it('calls state.selectNextToken()', function() {
      element.triggerHandler('click');
      expect(results.nextToken).toBeTruthy();
    });
  });
});
