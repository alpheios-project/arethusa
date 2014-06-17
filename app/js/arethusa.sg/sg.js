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

    var findDependentLabelSet = function(nestingLevel, morph, id) {
      var category, nestedCategory;
      angular.forEach(nestingLevel, function(val, label){
        if (val.dependency) {
          angular.forEach(val.dependency, function(depVal, depCat) {
            if (morph[depCat] === depVal) {
              category = nestingLevel[createKey(depVal)].nested;
              nestedCategory = findDependentLabelSet(category, morph, id);
              self.grammar[id].ancestors.unshift(val);
            }
          });
        }
      });
      if (nestedCategory) {
        return nestedCategory;
      } else {
        return category;
      }
    };

    var createMenu = function() {
      return arethusaUtil.inject({}, state.tokens, function(memo, id, token) {
        var morph = state.tokens[id].morphology.attributes || {};
        var tree = findDependentLabelSet(self.labels, morph, id);
        memo[id] = tree;
      });
    };

    this.selectOptions = function(id) {
      return self.menu[id];
    };

    this.init = function() {
      configure();
      self.grammar = createInternalState();
      self.menu = createMenu();
    };
  }
]);
