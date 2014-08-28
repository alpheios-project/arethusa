"use strict";

describe("unusedTokenHighlighter", function() {
  var element;
  var state;
  var scope;
  var parentScope;

  var template1 = '\
    <span\
      unused-token-highlighter\
      uth-check-property="head.id">\
    </span>\
  ';

  var template2 = '\
    <span\
      unused-token-highlighter\
      uth-check-property="relation.label">\
    </span>\
  ';

  var template3 = '\
    <span\
      unused-token-highlighter\
      uth-check-property="relation.label"\
      unused-token-style="customStyle">\
    </span>\
  ';

  var template4 = '\
    <span\
      unused-token-highlighter="true"\
      uth-check-property="relation.label">\
    </span>\
  ';


  function init(template, fn) {
    inject(function($compile, $rootScope, _state_) {
      state = _state_;
      state.replaceState(arethusaMocks.tokens());
      state.postInit();

      parentScope = $rootScope.$new();
      element = angular.element(template);

      if (angular.isFunction(fn)) fn();

      $compile(element)(parentScope);
      scope = element.isolateScope();
      scope.$digest();
    });
  }

  function t1Style() {
    return angular.copy(state.getToken('01').style);
  }

  var defaultStyle = { "background-color": "rgb(255, 216, 216)" };

  beforeEach(function() {
    module("arethusa.core", function($provide) {
      $provide.value('configurator', arethusaMocks.configurator());
    });
  });

  describe('general behaviour', function() {
    beforeEach(function() { init(template1); });

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

    describe('on click', function() {
      it('highlights unused tokens', function() {
        expect(t1Style()).toBeUndefined();
        state.change('01', 'head.id', '');

        element.triggerHandler('click');

        expect(t1Style()).toBeDefined();
      });

      it('unhighlights when clicked again', function() {
        expect(t1Style()).toBeUndefined();
        state.change('01', 'head.id', '');

        element.triggerHandler('click');

        var highlightedStyle = t1Style();
        expect(highlightedStyle).toBeDefined();

        element.triggerHandler('click');

        var unhighlightedStyle = t1Style();
        expect(highlightedStyle).not.toEqual(unhighlightedStyle);
      });

      it('the style used defaults to a light-red background color', function() {
        state.change('01', 'head.id', '');

        element.triggerHandler('click');

        expect(t1Style()).toEqual(defaultStyle);
      });
    });

    describe('on dblclick', function() {
      it('selects unused tokens', function() {
        expect(state.clickedTokens).toEqual({});

        state.change('01', 'head.id', '');

        element.triggerHandler('dblclick');

        expect(state.clickedTokens).not.toEqual({});
        expect(state.isClicked('01')).toBeTruthy();
      });
    });
  });

  describe('uth-check-property', function() {
    beforeEach(function() { init(template2); });

    it('allows to define the token property checked', function() {
      // Initially all tokens in Arethusa mocks have relation labels
      expect(scope.unusedCount).toEqual(0);

      state.change('01', 'relation.label', '');
      expect(scope.unusedCount).toEqual(1);
    });
  });

  describe('uth-token-style', function() {
    var customStyle = { color: 'red' };

    beforeEach(function() {
      init(template3, function() {
        parentScope.customStyle = customStyle;
      });
    });

    it('allows to define the style used to highlight unused tokens', function() {
      // At startup, the token is completely unstyled
      expect(t1Style()).toBeUndefined();

      state.change('01', 'relation.label', '');

      element.triggerHandler('click');

      expect(t1Style()).toEqual(customStyle);
    });
  });

  describe("when the directive's main attribute is set to true", function() {
    beforeEach(function() {
      init(template4, function() {
        state.change('01', 'relation.label', '');
      });
    });

    it('highlights unused tokens by default', function() {
      // in this scenario we have 1 unused token when the directive is launched
      expect(scope.unusedCount).toEqual(1);

      expect(t1Style()).toEqual(defaultStyle);
    });
  });
});
