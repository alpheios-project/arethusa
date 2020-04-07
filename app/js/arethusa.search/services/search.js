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
      console.info("QUERY",query);
      return arethusaUtil.inject([], self.strings, function (memo, string, ids) {
        var matchedIds = []
        if (self.compareWords(string,query.word)) {
          angular.forEach(ids, function(id) {
            var matchedPrefix = false;
            var matchedSuffix = false;
            if (query.prefix) {
              var prefixWords = query.prefix.split(' '); 
              var previousTokens = state.getPreviousTokens(id,prefixWords.length);
              var previousTokenStrings = arethusaUtil.map(previousTokens, function(t) { 
                return t.string
              });
              
              if (self.compareWords(previousTokenStrings.join(' '),query.prefix)) {
                matchedPrefix = true
              }

            } else {
              matchedPrefix = true;
            }
            if (query.suffix) {
              var suffixWords = query.suffix.split(' '); 
              var nextTokens = state.getNextTokens(id,suffixWords.length);
              var nextTokenStrings = arethusaUtil.map(nextTokens, function(t) { 
                return t.string
              });
              if (self.compareWords(nextTokenStrings.join(' '),query.suffix)) {
                matchedSuffix = true;
              }
            } else {
              matchedSuffix = true;
            }
            if (matchedPrefix && matchedSuffix) {
              matchedIds.push(id);
            }
          });
        } 
        arethusaUtil.pushAll(memo, matchedIds);
      });
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
      console.info("QUERIES",queries);
      var ids = arethusaUtil.inject([], queries, function (memo, query) {
         var hits = self.findWordInContext(query)
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
