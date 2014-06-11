"use strict";

describe('lang-specific directive', function() {
  var element;
  var documentStore;
  function createLanguageSettingsWith(settings) {
    return {
      getFor: function(doc) {
        return settings;
      }
    };
  }

  beforeEach(module('arethusa.core'));

  var createElement = function() {
    inject(function ($compile, $rootScope) {
      var $scope = $rootScope.$new();
      element = angular.element("<span lang-specific />");
      $compile(element)($scope);
    });
  };

  describe('Arabic', function() {
    var arabicSettings = {
      lang: 'ar',
      leftToRight: false,
      font: "some font"
    };
    beforeEach(module(function($provide) {
      $provide.value('languageSettings',
        createLanguageSettingsWith(arabicSettings));
    }));

    beforeEach(function() {
      createElement();
    });

    it('sets the language on the html element', function() {
      expect(element.attr('lang')).toEqual(arabicSettings.lang);
    });

    it('sets the text direction on the html element', function() {
      expect(element.attr('dir')).toEqual('rtl');
    });

    it('sets another font', function() {
      expect(element.css('font-family')).toMatch(arabicSettings.font);
    });
  });

  describe('unspecified language', function() {
    beforeEach(module(function($provide) {
      $provide.value('languageSettings', createLanguageSettingsWith(undefined));
    }));

    beforeEach(function() {
      createElement();
    });

    it('does not set any language on the html element', function() {
      expect(element.attr('lang')).toBeUndefined();
    });

    it('does not set dir on the html element', function() {
      expect(element.attr('dir')).toBeUndefined();
    });
  });
});

