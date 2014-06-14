"use strict";

angular.module('arethusa.sg').service('sg', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    var noob = {};
    this.labelAs = "long";
    this.defineAncestors = true;

    function configure() {
      configurator.getConfAndDelegate('sg', self, ['labels']);
    }

    configure();

    function sgTemplate() {
      return {
        morph: {},
        ancestors: []
      };
    }

    function createInternalState() {
      return arethusaUtil.inject({}, state.tokens, function(memo, id, token) {
        var obj = sgTemplate();
        obj.string = token.string;
        memo[id] = obj;
      });
    }

    this.currentGrammar = function() {
      return arethusaUtil.inject({}, state.selectedTokens, function(memo, id, event) {
        var morph = state.tokens[id].morphology || {};
        var grammar = self.grammar[id];
        angular.extend(grammar.morph, morph.attributes);
        memo[id] = grammar;
      });
    };

    var createKey = function(arg) {
      return arg.toUpperCase();
    };

    this.selectOptions = function(obj) {
      var pos = obj.morph.pos;
      var casus = obj.morph.case;
      var mood = obj.morph.mood;

      var categories = self.labels[createKey(pos)].nested;

      return categories;
      //if (pos === "noun") {
        //return self.labels[key(pos)].nested[key(casus)].nested;
      //} else {
        //if (pos === "adj" ) {
          //return self.labels[key(pos)].nested;
        //} else {
          //if (mood === "part" || mood === "inf") {
            //return self.labels[key(mood)].nested;
          //} else {
            //return noob;
          //}
        //}
      //}
    };

    this.init = function() {
      configure();
      self.grammar = createInternalState();
    };
  }
]);
