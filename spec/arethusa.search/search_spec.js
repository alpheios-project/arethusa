'use strict';

describe('search', function() {
  var search, state;

  beforeEach(function() {
    module('arethusa.core', function($provide) {
      $provide.value('configurator', arethusaMocks.configurator());
    });

    module('arethusa.search');

    inject(function(_search_, _state_) {
      search = _search_;
      state = _state_;
      state.tokens = arethusaMocks.tokens();
      state.tokens['03'].string = 'virum';
      search.init();
    });
  });

  describe('this.findByRegex', function() {
    describe('finds tokens by a regex and returns their id in an array', function() {
      it('with simple regex', function() {
        var arg = 'um';
        expect(search.findByRegex(arg)).toEqual(['02', '03']);
      });
    });

    describe('with meta characters', function() {
      it('with .', function() {
        var arg = 'r.m';
        expect(search.findByRegex(arg)).toEqual(['02', '03']);
      });

      it('with *', function() {
        var arg = 'v.*m';
        expect(search.findByRegex(arg)).toEqual(['02', '03']);
      });

      it('...', function() {
        // more tests to follow
      });
    });
  });

  describe('this.queryTokens', function() {
    describe('returns a multiselection', function() {
      it('with one search lemma', function() {
        search.tokenQuery = 'virum';
        search.queryTokens();
        expect(state.isSelected('02')).toBeTruthy();
        expect(state.isSelected('03')).toBeTruthy();
        expect(state.isSelected('01')).toBeFalsy();
        expect(state.isSelected('04')).toBeFalsy();
      });

      it('with two search lemmata', function() {
        search.tokenQuery = 'Arma virum';
        search.queryTokens();
        expect(state.isSelected('01')).toBeTruthy();
        expect(state.isSelected('02')).toBeTruthy();
        expect(state.isSelected('03')).toBeTruthy();
        expect(state.isSelected('04')).toBeFalsy();
      });

      it('with a lemma and a regex', function() {
        search.queryByRegex = true;
        search.tokenQuery = 'Arma v.*m';
        search.queryTokens();
        expect(state.isSelected('01')).toBeTruthy();
        expect(state.isSelected('02')).toBeTruthy();
        expect(state.isSelected('03')).toBeTruthy();
        expect(state.isSelected('04')).toBeFalsy();
      });
    });
  });

  // This function has been made private
  describe('this.collectTokenStrings', function() {
    xit('collects all strings of tokens as keys with their ids as values in an array', function() {
      var res = {'Arma': ['01'], 'virum': ['02', '03'], 'cano': ['04']};
      expect(search.collectTokenStrings()).toEqual(res);
    });
  });

  describe('this.init', function() {
    it('initializes the plugin by collecting all token strings and providing a model for input form', function() {
      search.init();
      var res = {'Arma': ['01'], 'virum': ['02', '03'], 'cano': ['04']};
      expect(search.strings).toEqual(res);
      expect(search.tokenQuery).toEqual('');
    });
  });
});
