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

    this.selectOptions = function(obj) {
      var pos = obj.morph.pos;
      var posKey = pos.toUpperCase();
      var casus = obj.morph.case;
      var casusKey = casus.toUpperCase();

      if (pos === "noun") {
        return self.labels[posKey].nested[casusKey].nested;
      } else {
        if (pos === "adj") {
          return self.labels.ADJ.nested;
        } else {
          return noob;
        }
      }
    };

    this.init = function() {
      configure();
      self.grammar = createInternalState();
    };
  }
]);
