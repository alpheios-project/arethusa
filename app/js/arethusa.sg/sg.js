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

    var findDependentLabelSet = function(nestingLevel, morph) {
      var category;
      angular.forEach(nestingLevel, function(val, label){
        angular.forEach(val.dependency, function(depVal, depCat) {
          if (morph[depCat] === depVal) {
            category = nestingLevel[createKey(depVal)].nested;
          }
        });
      });
      return category;
    };

    this.selectOptions = function(obj) {
      var morph = {
        pos: obj.morph.pos,
        case: obj.morph.case,
        mood: obj.morph.mood
      };

      var category = findDependentLabelSet(self.labels, morph);
      return category;
    };

    this.init = function() {
      configure();
      self.grammar = createInternalState();
    };
  }
]);
