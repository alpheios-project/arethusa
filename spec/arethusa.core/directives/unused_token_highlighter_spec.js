"use strict";

describe("unusedTokenHighlighter", function() {
  var element;
  var state;
  var scope;

  var template = '\
    <span\
      unused-token-highlighter\
      uth-check-property="head.id">\
    </span>\
  ';

  beforeEach(function() {
    module("arethusa.core", function($provide) {
      $provide.value('configurator', arethusaMocks.configurator());
    });

    inject(function($compile, $rootScope, _state_) {
      state = _state_;
      state.replaceState(arethusaMocks.tokens());
      state.postInit();

      element = angular.element(template);
      scope = $rootScope;
      $compile(element)($rootScope);

      scope = element.isolateScope();
      scope.$digest();
    });
  });


  describe('keeps track of total tokens', function() {
    it('on init', function() {
      var total = state.totalTokens;
      expect(scope.total).toEqual(total);
    });

    it('when a token was added', function() {
      var total = state.totalTokens;
      state.addToken({ id: 28, head: { id: '02' } }, 28);
      expect(scope.total).toEqual(total + 1);
    });

    it('when a token was removed', function() {
      var total = state.totalTokens;
      state.removeToken('01');
      expect(scope.total).toEqual(total - 1);
    });
  });

  describe('keeps track of unused tokens', function() {
    it('when everything is used', function() {
      // All tokens in Arethusa mocks have heads
      expect(scope.unusedCount).toEqual(0);
    });

    it('when not everything is used', function() {
      state.change('01', 'head.id', '');
      expect(scope.unusedCount).toEqual(1);
    });

    it('when things change often', function() {
      state.change('01', 'head.id', '');
      expect(scope.unusedCount).toEqual(1);

      state.change('02', 'head.id', '');
      expect(scope.unusedCount).toEqual(2);

      state.change('02', 'head.id', '01');
      expect(scope.unusedCount).toEqual(1);
    });

    it('when things are changed that were used before', function() {
      expect(scope.unusedCount).toEqual(0);
      state.change('02', 'head.id', '01');
      expect(scope.unusedCount).toEqual(0);
    });
  });
});
