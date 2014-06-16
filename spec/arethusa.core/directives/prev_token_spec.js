"use strict";

describe('prevToken', function() {
  var element;
  var results;
  var mockState = {
    selectPrevToken: function() {
      results.prevToken = true;
    }
  };

  beforeEach(module('arethusa.core', function($provide) {
    $provide.value('state', mockState);
  }));

  beforeEach(inject(function($compile, $rootScope) {
    element = angular.element('<span prev-token/>');
    $compile(element)($rootScope);
    results = {};
  }));

  describe('on click', function() {
    it('calls state.selectprevToken()', function() {
      element.triggerHandler('click');
      expect(results.prevToken).toBeTruthy();
    });
  });
});

