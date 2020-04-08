'use strict';
angular.module('arethusa.search').service('search', [
  'state',
  'configurator',
  'keyCapture',
  'plugins',
  function (state, configurator, keyCapture, plugins) {
    var self = this;
    this.name = 'search';

    this.defaultConf = {
      displayName: 'selector',
      queryByRegex: true
    };

    function configure() {
      var props = [
        'queryByRegex'
      ];

      configurator.getConfAndDelegate(self);
      configurator.getStickyConf(self, props);

      self.focusStringSearch = false;
      self.greekRegex = keyCapture.conf('regex').greek;
    }

    this.findByRegex = function(str) {
      // We might need to escape some chars here, we need to try
      // this out more
      angular.forEach(self.greekRegex, function(diacr, plain) {
        var toBeSubstituted = new RegExp(plain, 'g');
        str = str.replace(toBeSubstituted, diacr);
      });
      var regex = new RegExp(str, 'i');
      return arethusaUtil.inject([], self.strings, function (memo, string, ids) {
        if (string.match(regex)) {
          arethusaUtil.pushAll(memo, ids);
        }
      });
    };

    this.findWordInContext = function(query) {

      return arethusaUtil.inject([], self.strings, function (memo, string, ids) {
        var matchedIds = [];
        angular.forEach(ids, function(id) {
          var prefixWords = [];
          var suffixWords = [];
          if (query.prefix) {
            prefixWords = query.prefix.split(' ');
          } 
          if (query.suffix) {
            suffixWords = query.suffix.split(' ');
          }
          var previousToken = state.getPreviousTokens(id,1);
          var nextToken = state.getNextTokens(id,1);
          var nextString = nextToken.length > 0 ? nextToken[0].string : null;
          var prevString = previousToken.length > 0 ? previousToken[0].string : null;
          var match = self.compareWordsWithContext(string,prevString,nextString,query.word,false);
          var extraId = null;
          if (match.match) {
            if (match.combine < 0) { 
              extraId = previousToken[0].id;
            } else if (match.combine > 0) {
              extraId = nextToken[0].id;
            }
            var matchedPrefixWords = 0;
            var matchedSuffixWords = 0;
            var previousTokens = [];
            var prefixIndex = 0;
            if (query.prefix) {
              var startingId = match.combine < 0 ? extraId : id;
              previousTokens = state.getPreviousTokens(startingId,prefixWords.length);
              for (var i=0; i<previousTokens.length; i++) {
                var nextString = previousTokens[i+1] ? previousTokens[i+1].string : null;
                var prevString = i > 0 && previousTokens[i-1] ? previousTokens[i-1].string : null;
                var matchP = self.compareWordsWithContext(previousTokens[i].string,prevString,nextString,prefixWords[prefixIndex],true);
                if (matchP.match) {
                  matchedPrefixWords++;
                  if (matchP.combine != 0) {
                    matchedPrefixWords++;
                    prefixIndex = prefixIndex - matchP.combine;
                  } 
                }
                prefixIndex++
              }
            } 
            var nextTokens = [];
            if (query.suffix) {
              var startingId = match.combine > 0 ? extraId : id;
              nextTokens = state.getNextTokens(startingId,suffixWords.length);
              var suffixIndex = 0;
              for (var i=0; i<nextTokens.length; i++) {
                var nextString = nextTokens[i+1] ? nextTokens[i+1].string : null;
                var prevString = i > 0 && nextTokens[i-1] > 0 ? nextTokens[i-1].string : null;
                var matchS = self.compareWordsWithContext(nextTokens[i].string,prevString,nextString,suffixWords[suffixIndex],true);
                if (matchS.match) {
                  matchedSuffixWords++;
                  if (matchS.combine != 0) {
                    matchedSuffixWords++;
                    suffixIndex = suffixIndex - matchS.combine;
                  } 
                }
                suffixIndex++
              }
            }
            console.info("Matched Prefix Words for",query.word,matchedPrefixWords,previousTokens.length);
            console.info("Matched Suffix Words for",query.word,matchedSuffixWords,nextTokens.length);
            if (matchedPrefixWords == previousTokens.length && matchedSuffixWords == nextTokens.length) {
              matchedIds.push(id);
              if (extraId) {
                matchedIds.push(extraId);
              }
            }
          } 
        });
        arethusaUtil.pushAll(memo, matchedIds);
      });
    };

    this.compareWordsWithContext = function(wordA,wordAPrev,wordANext,wordB,testWordEnclytics) {
      var match = self.compareWords(wordA,wordB);
      var combine = 0;
      // handle split enclytics  - 
      // test to see if next or preceding word has begins or ends with - and test combined
      if (!match && wordANext && wordANext.match(/^-/)) {
        match = self.compareWords(wordA + wordANext.replace(/^-/,''),wordB);
        if (match) {
          combine = 1;
        }
      }
      if (!match ) {
        if (wordAPrev && wordAPrev.match(/-$/)) {
          match = self.compareWords(wordAPrev.replace(/-$/,'') + wordA, wordB);
        } else if (wordAPrev && wordAPrev.match(/^-/)) {
           match = self.compareWords(wordA + wordAPrev.replace(/^-/,''),wordB);
        }
        if (match) {
          combine = -1;
        } 
      }
      if (!match && testWordEnclytics && (wordA.match(/^-/) || wordA.match(/-$/))) {
        var testWord;
        if (wordA.match(/^-/)) {
          wordA = wordA.replace(/^-/,'');
        } else {
          wordA = wordA.replace(/-$/,'');
        }
        if (wordAPrev) {
          match = self.compareWords(wordAPrev + wordA,wordB);
          if (!match) {
            match = self.compareWords(wordA + wordAPrev,wordB);
          }
          if (match) {
            combine = -1;
          } 
        } else if (wordANext) {
          match = self.compareWords(wordA + wordANext,wordB);
          if (!match) {
            match = self.compareWords(wordANext + wordA,wordB);
          }
          if (match) {
            combine = 1;
          }
        }
      }
      return { match: match, combine: combine };
    };


    this.compareWords = function(wordA,wordB) {
      // todo we need to support language specific normalization
      return wordA === wordB;
    };

    this.queryTokens = function () {
      if (self.tokenQuery === '') {
        state.deselectAll();
        return;
      }
      var tokens = self.tokenQuery.split(' ');
      var ids = arethusaUtil.inject([], tokens, function (memo, token) {
          var hits = self.queryByRegex ? self.findByRegex(token) : self.strings[token];
          arethusaUtil.pushAll(memo, hits);
        });
      state.multiSelect(ids);
    };

    this.queryWordInContext = function(word,prefix,suffix) {
      var queries = [ { word: word, prefix: prefix, suffix: suffix } ]
      var ids = arethusaUtil.inject([], queries, function (memo, query) {
         var hits = self.findWordInContext(query);
         arethusaUtil.pushAll(memo, hits);
       });
       return ids;  
    };

    // Init
    this.collectTokenString = function(container, id, token) {
      var str = token.string;
      if (!container[str]) {
        container[str] = [];
      }
      container[str].push(id);
    };

    function collectTokenStrings() {
      return arethusaUtil.inject({}, state.tokens, self.collectTokenString);
    }

    this.removeTokenFromIndex = function(id, string) {
      var ids = self.strings[string];
      ids.splice(ids.indexOf(id), 1);
      if (ids.length === 0) {
        delete self.strings[string];
      }
    };


    state.on('tokenAdded', function(event, token) {
      self.collectTokenString(self.strings, token.id, token);
    });

    state.on('tokenRemoved', function(event, token) {
      self.removeTokenFromIndex(token.id, token.string);
    });

    function focusSearch() {
      plugins.setActive(self);
      self.focusStringSearch = true;
    }

    keyCapture.initCaptures(function(kC) {
      return {
        search: [
          kC.create('focus', focusSearch, 'A')
        ]
      };
    });

    function getSearchPlugins() {
      return arethusaUtil.inject([], plugins.all, function(memo, name, plugin) {
        if (plugin.canSearch) memo.push(plugin);
      });
    }

    this.init = function () {
      configure();
      self.searchPlugins = getSearchPlugins();
      self.strings = collectTokenStrings();
      self.tokenQuery = '';  // model used by the input form
    };
  }
]);
