"use strict";

// This file is a little heavier commented than usual to serve an
// educational purpose on how to test Arethusa directives (and
// more generally also all Angular directives) effectively.
//
// vim users accustomed to using UltiSnips might also want to take
// at https://github.com/LFDM/dotfiles/blob/master/snippets/ultisnips/javascript.snippets
//
// The ajd (mnemomic: arethusa jasmine directive) snippet helps to
// rapidly set up such a spec file.

describe("unusedTokenHighlighter", function() {
  // We define a couple of variables accessible to every spec.
  var element, state, scope, parentScope;

  // The template variables show different usage examples of the
  // unusedTokenHighlighter directive.

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

  // As unusedTokenHighlighter is placed in the arethusa.core module,
  // we need to define it beforeEach spec.
  // Pretty much every aspect of Arethusa uses the configurator, which
  // we $provide as a mock object.
  //
  // This mock object is available in the arethusaMocks spec helper.
  beforeEach(function() {
    module("arethusa.core", function($provide) {
      $provide.value('configurator', arethusaMocks.configurator());
      $provide.value('navigator', arethusaMocks.navigator());
      $provide.value('confirmationDialog', arethusaMocks.resolvedConfirmationDialog());
      $provide.value('idHandler', arethusaMocks.idHandler());
    });
  });

  // The init function is meant to be called inside of particular
  // describe functions and needs to be called beforeEach spec.
  //
  // It helps to setup a valid environment for the directive tested,
  // by initializing Arethusa's state service properly.
  //
  // Its first argument defines the template which should be used to
  // $compile the directive.
  //
  // The second argument is optional and allows to define a function,
  // which allows to manipulate the environment BEFORE the directive
  // is compiled.
  //
  // We will later see this in effect.
  function init(template, fn) {
    inject(function($compile, $rootScope, _state_) {
      state = _state_;
      state.initServices();
      state.replaceState(arethusaMocks.tokens());
      state.postInit();

      parentScope = $rootScope.$new();
      element = angular.element(template);

      if (angular.isFunction(fn)) fn();

      $compile(element)(parentScope);

      // As unusedTokenHighlighter uses an isolateScope, we provide
      // just that.
      // Directives that use a parent or child scope have to provide
      // elemet.scope() here!
      scope = element.isolateScope();
      scope.$digest();
    });
  }

  // As the unusedTokenHighlighter's main purpose is to manipulate
  // the style of tokens, we define a function to quickly access
  // such a token style.
  // angular.copy is called so that we can really test against a
  // snapshot at a particular time.
  function t1Style() {
    return angular.copy(state.getToken('01').style);
  }

  var defaultStyle = { "background-color": "rgb(255, 216, 216)" };

  describe('general behaviour', function() {
    // This is the first time we have to call our init function.
    //
    // beforeEach spec inside the describe functions, which tests
    // the general behaviour of the directive, we use our directive
    // with template1.
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

    // To test the uth-token-style property, we need to have access
    // to a scope variable defined on the parent scope which wants
    // to use this directive.
    //
    // The init function's second argument allows to such manipulations.
    //
    // template3 wants to see a customStyle scope variable on the parentScope.
    // As the function provided by the second argument is called right
    // before the compilation of our directive, we can use it to set this
    // scope variable properly.
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
    // This init function shows another use of the function in the second
    // argument.
    // The unusedTokenHighlighter directive injects Arethusa's state service.
    // In this case we need state to be in a specific state, before we compile
    // the directive
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
