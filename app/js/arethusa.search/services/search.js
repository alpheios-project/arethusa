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


    /**
     * helper function to find all of the words in the current token state
     * that match the supplied query word, taking surrounding context into account
     * @param {String} word the query word
     * @return {Object[]} array of matched items objects in the format
     *        { id: <matched token id>,
     *          includeNext: <id of next token if included in the match>,
     *          includePrevious: <id of previous token if included in the match>
     *        }
     */
    function matchingWords(word) {
      var matches = [];
      var matchedIds = {};
      angular.forEach(self.strings, function(ids,string) {
        angular.forEach(ids, function(id) {
          if (! matchedIds[id]) {
            // only bother if we haven't already matched on this token
            var previousToken = state.getPreviousTokens(id,1);
            var nextToken = state.getNextTokens(id,1);
            var nextString = nextToken.length > 0 ? nextToken[0].string : null;
            var prevString = previousToken.length > 0 ? previousToken[0].string : null;
            var match = self.compareWordsWithContext(string,prevString,nextString,word);
            if (match.match) {
              matchedIds[id] = 1;
              var matchData = {
                id: id,
              }
              if (match.combine < 0) {
                matchedIds[previousToken[0].id] = 1;
                matchData.includePrevious = previousToken[0].id;
              } else if (match.combine > 0) {
                matchData.includeNext = nextToken[0].id;
                matchedIds[nextToken[0].id] = 1;
              }
              matches.push(matchData)
            }
          }
        });
      });
      return matches;
    }

    /**
     * helper function to find the number of tokens that match a prefix string
     * @param {String} id the starting token id
     * @return {int} number of matching prefix tokens
     */
    function matchingPrefixTokens(startingId,prefix) {
      var matchedTokens = 0;
      var words = tokenize(prefix);
      if (words.length > 0) {
        var contextTokens = state.getPreviousTokens(startingId);
        var tokenIndex = contextTokens.length-1;
        for (var i=words.length-1; i>=0; i--) {
          var contextString = getTokenContext(contextTokens,tokenIndex)
          if (contextString.word) {
            var matchP = self.compareWordsWithContext(contextString.word,contextString.prev,contextString.next,words[i]);
            if (matchP.match) {
              tokenIndex--;
              matchedTokens++;
              if (matchP.combine < 0) {
                // if the match included the previous token, then skip testing that token
                tokenIndex = tokenIndex + matchP.combine;
              }
            }
          }
        }
      }
      return matchedTokens;
    };

    /**
     * helper function to find the number of tokens that match a suffix string
     * @param {String} id the starting token id
     * @return {int} number of matching suffix tokens
     */
    function matchingSuffixTokens(startingId, suffix) {
      var matchedTokens = 0;
      var words = tokenize(suffix);
      if (words.length > 0) {
        var contextTokens = state.getNextTokens(startingId);
        var tokenIndex = 0;
        for (var i=0; i<contextTokens.length; i++) {
          var contextString = getTokenContext(contextTokens,tokenIndex)
          if (contextString.word) {
            var matchS = self.compareWordsWithContext(contextString.word,contextString.prev,contextString.next,words[i]);
            if (matchS.match) {
              tokenIndex++;
              matchedTokens++;
              if (matchS.combine > 0) {
                // if the match included the next token, then skip testing that token
                tokenIndex = tokenIndex - matchS.combine;
              }
            }
          }
        }
      }
      return matchedTokens;
    };

    /**
     * helper function to get context from a token
     * @param {Object[]} tokens array of token objects
     * @param {int} index of the token
     */
    function getTokenContext(tokens,index) {
      var context = {};
      if (tokens[index]) {
        context.word =  tokens[index].string;
        context.next = tokens[index+1] ? tokens[index+1].string : "";
        context.prev = index > 0 && tokens[index-1] ? tokens[index-1].string : "";
      }
      return context;
    }

    /**
     * Execute a query to find a matching word token from the current tokens,
     * using context for disambiguation among multiple results
     * @param {String} word word to query
     * @param {String} prefix string of words that occur before this word
     * @param {String} suffix string of words that occur after this word
     * @return {Object[]} array of best matching token ids
     */
    this.queryWordInContext = function(word,prefix,suffix) {
      var matches = matchingWords(word);
      if (matches.length > 1) {
        // iterate through the matches, and see how many of the prefix and
        // context words match for each
        // only need to test prefix and suffix if
        // we didn't find more than one possible match
        angular.forEach(matches,function(match) {
          match.matchedPrefix = 0;
          match.matchedSuffix = 0;
          var startingId = match.includePrevious ? match.includePrevious :
            match.includeNext ? match.includeNext : match.id;
          match.matchedPrefix = matchingPrefixTokens(startingId, prefix);
          match.matchedSuffix = matchingSuffixTokens(startingId, suffix);
       });
       var maxPrefix = 0;
       var maxSuffix = 0;
       var bestMatches = [];
       // iterate through the matches, keeping only the ones with the highest number
       // of matching prefix and suffix words
       angular.forEach(matches,function (match) {
         if ((match.matchedPrefix > maxPrefix && match.matchedSuffix > maxSuffix) ||
             (match.matchedPrefix == maxPrefix && match.matchedSuffix > maxSuffix) ||
             (match.matchedPrefix > maxPrefix && match.matchedSuffix == maxSuffix)) {
            // if at least one of maxPrefix or maxSuffix is higher than previously
            // seen then we can discard the other matches
            maxPrefix = match.matchedPrefix;
            maxSuffix = match.matchedSuffix;
            bestMatches = [match]
         } else if (match.matchedPrefix == maxPrefix && match.matchedSuffix == maxSuffix) {
            // both maxPrefix and maxSuffix are the same as previously seen
            // then we have to *add* this to the possible matches
            bestMatches.push(match);
         }
       });
     } else {
       bestMatches = matches;
     }
     var finalMatches = [];
     angular.forEach(bestMatches,function(match) {
      finalMatches.push(match.id);
      if (match.includePrevious) {
        finalMatches.push(match.includePrevious);
      }
      if (match.includeNext) {
        finalMatches.push(match.includeNext);
      }
    });
    return finalMatches;
   };

    /**
     * compare two words, account for the fact that wordB may be represented by a combination
     * of wordA with an enclytic that appears before or after it
     * @param {String} wordA - token which may be a partial word
     * @param {String} wordAPrev - token which appears before wordA (may be null)
     * @param {String} wordANext - token which appears after wordA (may be null)
     * @param {String} wordB- word which is being compared (and which may
     *                         include an enclytic)
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
