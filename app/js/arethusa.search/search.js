'use strict';
angular.module('arethusa.search').service('search', [
  'state',
  'configurator',
  function (state, configurator) {
    var self = this;
    this.conf = configurator.configurationFor('search');
    this.name = this.conf.name;
    this.template = this.conf.template;
    this.queryByRegex = this.conf.regex;

    this.findByRegex = function(str) {
      // We might need to escape some chars here, we need to try
      // this out more
      var regex = new RegExp(str, 'i');
      return arethusaUtil.inject([], self.strings, function (memo, string, ids) {
        if (string.match(regex)) {
          arethusaUtil.pushAll(memo, ids);
        }
      });
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

    this.pluginsWithSearch = function(plugins) {
      return arethusaUtil.inject([], plugins, function(memo, name, plugin) {
        if (plugin.canSearch) {
          memo.push(plugin);
        }
      });
    };

    // Init
    function collectTokenString(container, id, token) {
      var str = token.string;
      if (!container[str]) {
        container[str] = [];
      }
      container[str].push(id);
    }

    this.collectTokenStrings = function () {
      return arethusaUtil.inject({}, state.tokens, collectTokenString);
    };

    state.on('tokenAdded', function(event, token) {
      collectTokenString(self.strings, token.id, token);
    });

    state.on('tokenRemoved', function(event, token) {
      var id  = token.id;
      var ids = self.strings[token.string];
      ids.splice(ids.indexOf(id), 1);
      if (ids.length === 0) {
        delete self.strings[token.string];
      }

    });

    this.init = function () {
      self.strings = self.collectTokenStrings();
      self.tokenQuery = '';  // model used by the input form
    };
  }
]);
