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
          var prefixWords;
          var suffixWords;
          if (query.prefix) {
            prefixWords = query.prefix.split(' ').length; 
          } else {
            prefixWords = 1;
          }
          if (query.suffix) {
            suffixWords = query.suffix.split(' ').length; 
          }  else {
            suffixWords = 1;
          }
          var previousTokens = state.getPreviousTokens(id,prefixWords);
          var nextTokens = state.getNextTokens(id,suffixWords);
          var match = self.compareWords(string,query.word);
          try {
          } catch (e) {
          }
          var extraId = null;
      	  // handle split enclytics  - 
          // test to see if next or preceding word has begins or ends with - and test combined
          if (!match && nextTokens.length > 0 && nextTokens[0].string.substring(0,1) === '-') {
            match = self.compareWords(string + nextTokens[0].string.substring(1),query.word);
            if (match) {
              extraId = nextTokens[0].id;
              // recalulate nextTokens based upon the next id if we need them for suffix testing
              if (query.suffix) {
                nextTokens = state.getNextTokens(extraId,suffixWords);
              }
            }
          }
          if (!match && previousTokens.length > 0) {
            var previous = previousTokens[previousTokens.length-1];
            // when its the previous token it might have the - at the beginning or end of the word
            if (previous.string.match(/-$/)) {
              match = self.compareWords(previous.string.replace(/-$/,'') + string,query.word);
            } 
            else if (previous.string.match(/^-/)) {
              match = self.compareWords(string + previous.string.replace(/^-/,''),query.word);
            }
            if (match) {
              extraId = previous.id;
              // recalulate previousTokens based upon the previous id if we need them for prefix testing
              if (query.prefix) {
                previousTokens = state.getPreviousTokens(extraId,prefixWords);
              }
            }
          }
          if (match) {
            var matchedPrefix = false;
            var matchedSuffix = false;
            if (query.prefix) {
              var previousTokenStrings = arethusaUtil.map(previousTokens, function(t) { 
                return t.string;
              });
              
              if (self.compareWords(previousTokenStrings.join(' '),query.prefix)) {
                matchedPrefix = true;
              }

            } else {
              matchedPrefix = true;
            }
            if (query.suffix) {
              var nextTokenStrings = arethusaUtil.map(nextTokens, function(t) { 
                return t.string;
              });
              if (self.compareWords(nextTokenStrings.join(' '),query.suffix)) {
                matchedSuffix = true;
              }
            } else {
              matchedSuffix = true;
            }
            if (matchedPrefix && matchedSuffix) {
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

    this.compareWords = function(wordA,wordB) {
      // todo we need to support language specific normalization
      // and punctuation
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
