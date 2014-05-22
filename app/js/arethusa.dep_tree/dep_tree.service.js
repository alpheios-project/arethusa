"use strict";

angular.module('arethusa.depTree').service('depTree', function(state, configurator, $rootScope) {
  var self = this;
  this.conf = configurator.configurationFor('depTree');
  this.template = this.conf.template;
  this.main = this.conf.main;

  this.diffMode = false;

  this.toggleDiff = function() {
    self.diffMode = ! self.diffMode;
  };

  // We have three things we can colorize as wrong in the tree
  //   Label
  //   Head
  //   and the word itself for morphological stuff
  function analyseDiffs(tokens) {
    return arethusaUtil.inject({}, tokens, function(memo, id, token) {
      var diff = token.diff;
      if (diff) {
        memo[id] = analyseDiff(diff);
      }
    });
  }

  function analyseDiff(diff) {
    return arethusaUtil.inject({}, diff, function(memo, key, val) {
      if (key === 'relation') {
        memo.label = { color: 'red' };
      } else {
        if (key === 'head') {
          memo.edge = { stroke: 'red', 'stroke-width': '1px'};
        } else {
          memo.token = { color: 'red' };
        }
      }
    });
  }

  this.diffStyles = function() {
    if (self.diffMode) {
      return self.diffInfo;
    } else {
      return false;
    }
  };

  $rootScope.$on('diffLoaded', function() {
    self.diffPresent = true;
    self.diffInfo = analyseDiffs(state.tokens);
  });

  this.init = function() {
  };
});
