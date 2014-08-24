"use strict";

describe("deselector", function() {
  var element;
  var state;

  beforeEach(module("arethusa.core", function($provide) {
    $provide.value('configurator', arethusaMocks.configurator());
  }));

  beforeEach(inject(function($compile, $rootScope, _state_) {
    element = angular.element("<span deselector/>");
    $compile(element)($rootScope);
    state = _state_;
  }));

  describe("on click", function() {
    it('deselects all tokens', function() {
      state.selectToken('01', 'ctrl-click');
      state.selectToken('02', 'ctrl-click');
      expect(state.hasSelections()).toBeTruthy();

      element.triggerHandler('click');
      expect(state.hasSelections()).toBeFalsy();
    });
  });
});
