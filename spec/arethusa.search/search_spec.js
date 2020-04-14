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
  describe('this.compareWordsWithContext', function() {
    it('finds a word with shifted enclytic', function()  {
      var res = search.compareWordsWithContext('virum','-que','any','virumque');
      expect(res).toBeTruthy();
      expect(res.match).toBeTruthy();
      expect(res.combine).toEqual(-1);
    });
    it('finds a word with post enclytic', function()  {
      var res = search.compareWordsWithContext('virum','any','-que','virumque');
      expect(res).toBeTruthy();
      expect(res.match).toBeTruthy();
      expect(res.combine).toEqual(1);
    });
    it('finds a word with pre krasis', function()  {
      var res = search.compareWordsWithContext('ἄπειτα','κ-','τῆς','κἄπειτα');
      expect(res).toBeTruthy();
      expect(res.match).toBeTruthy();
      expect(res.combine).toEqual(-1);
    });
    it('finds a word with pre enclytic where enclytic is tested', function()  {
      var res = search.compareWordsWithContext('-que','virum','any','virumque',true);
      expect(res).toBeTruthy();
      expect(res.match).toBeTruthy();
      expect(res.combine).toEqual(-1);
    });
    it('finds a word with shifted enclytic where enclytic is tested', function()  {
      var res = search.compareWordsWithContext('-que','any','virum','virumque',true);
      expect(res).toBeTruthy();
      expect(res.match).toBeTruthy();
      expect(res.combine).toEqual(1);
    });
  });
  describe('this.queryWordInContext', function() {
    beforeEach(function() {
      state.tokens = {
        '01': {
           id: '01',
           string: 'primus'
         },
        '02': {
          id: '02',
          string: 'Arma',
         },
         '03': {
           id: '03',
           string: 'virum',
         },
         '04': {
           id: '04',
           string: '-que',
         },
         '05': {
           id: '05',
           string: 'cano',
         },
         '06': {
           id: '06',
           string: 'Troiae',
         },
         '07': {
           id: '07',
           string: 'qui'
         },
         '08': {
           id: '08',
           string: 'primus'
         },
         '09': {
           id: '09',
           string: 'ab'
         },
         '10': {
           id: '10',
           string: 'veni'
         },
         '11': {
           id: '11',
           string: 'cano'
         },
         '12': {
           id: '12',
           string: 'Troiae'
         },
         '13': {
           id: '13',
           string: 'mare'
         },

       }
      search.init();
    });


    it('finds a word with prefix and suffix', function() {
      var ids = search.queryWordInContext('Troiae','cano','qui');
      expect(ids.length).toEqual(1);
      expect(ids[0]).toEqual('06');
    });

    it('finds a word with prefix and multi-word suffix', function() {
      var ids = search.queryWordInContext('Troiae','cano','qui primus');
      expect(ids.length).toEqual(1);
      expect(ids[0]).toEqual('06');
    });

    it('finds a word with multi-word prefix and suffix', function() {
      var ids = search.queryWordInContext('primus','Troiae qui','ab');
      expect(ids.length).toEqual(1);
      expect(ids[0]).toEqual('08');
    });

    it('finds a word with no prefix and a suffix', function() {
      var ids = search.queryWordInContext('primus','','Arma');
      expect(ids.length).toEqual(1);
      expect(ids[0]).toEqual('01');
    });

    it('finds a word with prefix and no suffix', function() {
      var ids = search.queryWordInContext('ab','primus','');
      expect(ids.length).toEqual(1);
      expect(ids[0]).toEqual('09');
    });

    it('does not find a word that is not there ', function() {
      var ids = search.queryWordInContext('prime','qui','ab');
      expect(ids.length).toEqual(0);
    });
    it('finds a word with enclytics', function() {
      var ids = search.queryWordInContext('virumque','Arma','cano');
      expect(ids.length).toEqual(2);
      expect(ids[0]).toEqual('03');
      expect(ids[1]).toEqual('04');
    });
    it('finds a word with shifted enclytics', function() {
      state.tokens['03'].string = '-que';
      state.tokens['04'].string = 'virum';
      search.init();
      var ids = search.queryWordInContext('virumque','Arma','cano');
      expect(ids.length).toEqual(2);
      expect(ids[0]).toEqual('03');
      expect(ids[1]).toEqual('04');
    });
    it('finds a word with enclytics in suffix', function() {
      var ids = search.queryWordInContext('Arma','', 'virumque cano Troiae');
      expect(ids.length).toEqual(1);
      expect(ids[0]).toEqual('02');
    });
    it('finds a word with enclytics in prefix', function() {
      var ids = search.queryWordInContext('cano','Arma virumque','Troiae');
      expect(ids.length).toEqual(1);
      expect(ids[0]).toEqual('05');
    });
    it('finds a word with prefix mismatch', function() {
      var ids = search.queryWordInContext('cano','veni','Troiae');
      expect(ids.length).toEqual(1);
      expect(ids[0]).toEqual('11');
    });
    it('finds a word with suffix mismatch', function() {
      var ids = search.queryWordInContext('Troiae','cano','qui');
      expect(ids.length).toEqual(1);
      expect(ids[0]).toEqual('06');
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
