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
        var matches = []
        angular.forEach(ids, function(id) {
          var previousToken = state.getPreviousTokens(id,1);
          var nextToken = state.getNextTokens(id,1);
          var nextString = nextToken.length > 0 ? nextToken[0].string : null;
          var prevString = previousToken.length > 0 ? previousToken[0].string : null;
          var match = self.compareWordsWithContext(string,prevString,nextString,query.word);
          if (match.match) {
            var matchData = {
              id: id,
              matchedPrefix: 0,
              matchedSuffix: 0
            }
            if (match.combine < 0) {
              matchData.includePrevious = previousToken[0].id;
            } else if (match.combine > 0) {
              matchData.includeNext = nextToken[0].id;
            }
            matches.push(matchData)
          }
        });
        // we only need to try to further narrow by context if we got more than
        // one hit
        if (matches.length > 1) {
          matches.forEach(function (match) {
            var startingId = match.includePrefix ? match.includePrefix :
              match.includeSuffix ? match.includeSuffix : match.id;
            var prefixWords = tokenize(query.prefix);
            var suffixWords = tokenize(query.suffix);
            var matchedPrefixWords = 0;
            var matchedSuffixWords = 0;
            var previousTokens = [];
            if (prefixWords.length > 0) {
              var previousTokens = state.getPreviousTokens(startingId);
              var tokenIndex = previousTokens.length-1;
              for (var i=prefixWords.length-1; i>=0; i--) {
                if (previousTokens[tokenIndex]) {
                  var token = previousTokens[tokenIndex];
                  var nextString = previousTokens[tokenIndex+1] ? previousTokens[tokenIndex+1].string : null;
                  var prevString = tokenIndex > 0 && previousTokens[tokenIndex-1] ? previousTokens[tokenIndex-1].string : null;
                  var matchP = self.compareWordsWithContext(token.string,prevString,nextString,prefixWords[i]);
                  if (matchP.match) {
                    tokenIndex--;
                    matchedPrefixWords++;
                    tokenIndex = tokenIndex + matchP.combine;
                  }
                }
              }
            }
            var nextTokens = [];
            if (suffixWords.length > 0) {
              nextTokens = state.getNextTokens(startingId);
              var tokenIndex = 0;
              for (var i=0; i<suffixWords.length; i++) {
                if (nextTokens[tokenIndex]) {
                  var token = nextTokens[tokenIndex];
                  var nextString = nextTokens[tokenIndex+1] ? nextTokens[tokenIndex+1].string : null;
                  var prevString = tokenIndex > 0 && nextTokens[tokenIndex-1] > 0 ? nextTokens[tokenIndex-1].string : null;
                  var matchS = self.compareWordsWithContext(token.string,prevString,nextString,suffixWords[i]);
                  if (matchS.match) {
                    tokenIndex++;
                    matchedSuffixWords++;
                    tokenIndex = tokenIndex - matchS.combine;
                  }
                }
              }
            }
            match.matchedPrefix = matchedPrefixWords;
            match.matchedSuffix = matchedSuffixWords;
          });
        }
        var maxPrefix = 0;
        var maxSuffix = 0;
        var bestMatches = [];
        matches.forEach(function (match) {
          if ((match.matchedPrefix > maxPrefix && match.matchedSuffix > maxSuffix) ||
           (match.matchedPrefix > maxPrefix && match.matchedSuffix == maxSuffix) ||
           (match.matchedPrefix == maxPrefix && match.matchedSuffix > maxSuffix)) {
            maxPrefix = match.matchedPrefix;
            maxSuffix = match.matchedSuffix;
            bestMatches = [match];
          } else if (match.matchedPrefix == maxPrefix && match.matchedSuffix == maxSuffix) {
            bestMatches.push(match)
          }
        });
        bestMatches.forEach(function (match) {
          memo.push(match.id);
          if (match.includePrevious) {
            memo.push(match.includePrevious);
          }
          if (match.includeNext) {
            memo.push(match.includeNext);
          }
        })
      });
    };

    /**
     * compare two words, account for the fact that wordB may be represented by a combination
     * of wordA with an enclytic that appears before or after it
     * @param {String} wordA - token which may be a partial word
     * @param {String} wordAPrev - token which appears before wordA (may be null)
     * @param {String} wordANext - token which appears after wordA (may be null)
     */
    this.compareWordsWithContext = function(wordA,wordAPrev,wordANext,wordB) {
      var match = compareWords(wordA,wordB);
      var combine = 0;
      // latin enclytics usually are preceded with a '-' and may be
      // either right after the base word or shifted to right before it
      if (!match && wordANext && wordANext.match(/^-/)) {
        match = compareWords(wordA + wordANext.replace(/^-/,''),wordB);
        if (match) {
          combine = 1;
        }
      }
      if (!match ) {
        // greek krasis is postfixed with a - and should appear before the
        // base word
        if (wordAPrev && wordAPrev.match(/-$/)) {
          match = compareWords(wordAPrev.replace(/-$/,'') + wordA, wordB);
        } else if (wordAPrev && wordAPrev.match(/^-/)) {
           // handles the case where the enclytic is shifted to before the word
           match = compareWords(wordA + wordAPrev.replace(/^-/,''),wordB);
        }
        if (match) {
          combine = -1;
        }
      }
      // recheck to see if the word we're testing is the enclytic
      if (!match && (wordA.match(/^-/) || wordA.match(/-$/))) {
        var testWord;
        if (wordA.match(/^-/)) {
          wordA = wordA.replace(/^-/,'');
        } else {
          wordA = wordA.replace(/-$/,'');
        }
        if (wordAPrev) {
          match = compareWords(wordAPrev + wordA,wordB);
          if (!match) {
            match = compareWords(wordA + wordAPrev,wordB);
          }
          if (match) {
            combine = -1;
          }
        }
        if (! match && wordANext) {
          match = compareWords(wordA + wordANext,wordB);
          if (!match) {
            match = compareWords(wordANext + wordA,wordB);
          }
          if (match) {
            combine = 1;
          }
        }
      }
      return { match: match, combine: combine };
    };


    function compareWords(wordA,wordB) {
      // todo we may want to support additional language 
      // specific normalization
      return wordA === wordB;
    };

    function tokenize(text) {
      // TODO we might want to handle punctuation, etc. 
      // but replicating external tokenization is a slippery slope
      // if it becomes necessary implementing fuzzy search algorithms
      // might be a better way to go
      return text.split(/\s+/);
    }

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
