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
    function findByRegex(str) {
      // We might need to escape some chars here, we need to try
      // this out more
      var regex = new RegExp(str, 'i');
      return arethusaUtil.inject([], self.strings, function (memo, string, ids) {
        if (string.match(regex)) {
          arethusaUtil.pushAll(memo, ids);
        }
      });
    }
    this.queryTokens = function () {
      if (self.tokenQuery === '') {
        state.deselectAll();
        return;
      }
      var tokens = self.tokenQuery.split(' ');
      var ids = arethusaUtil.inject([], tokens, function (memo, token) {
          var hits = self.queryByRegex ? findByRegex(token) : self.strings[token];
          arethusaUtil.pushAll(memo, hits);
        });
      state.multiSelect(ids);
    };
    this.collectTokenStrings = function () {
      return arethusaUtil.inject({}, state.tokens, function (memo, id, token) {
        var str = token.string;
        if (!memo[str]) {
          memo[str] = [];
        }
        memo[str].push(id);
      });
    };
    this.init = function () {
      self.strings = self.collectTokenStrings();
      self.tokenQuery = '';  // model used by the input form
    };
  }
]);
