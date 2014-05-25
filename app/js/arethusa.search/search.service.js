"use strict";

angular.module('arethusa.search').service('search', function(state, configurator) {
  var self = this;
  this.conf = configurator.configurationFor('search');
  this.name = this.conf.name;
  this.template = this.conf.template;

  this.queryTokens = function() {
    var tokens = self.tokenQuery.split(' ');
    var ids = arethusaUtil.inject([], tokens, function(memo, token) {
      arethusaUtil.pushAll(memo, self.strings[token]);
    });
    state.multiSelect(ids);
  };

  this.collectTokenStrings = function() {
    return arethusaUtil.inject({}, state.tokens, function(memo, id, token) {
      var str = token.string;
      if (! memo[str]) {
        memo[str] = [];
      }
      memo[str].push(id);
    });
  };

  this.init = function() {
    self.strings = self.collectTokenStrings();
  };
});
