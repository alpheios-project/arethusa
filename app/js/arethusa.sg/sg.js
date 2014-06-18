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
        ancestors: [],
        definingAttrs: [],
        menu: {}
      };
    }

    function grammarReset(grammar) {
      grammar.ancestors = [];
      grammar.definingAttrs = [];
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
        if (morphHasChanged(grammar.morph, morph.attributes)) {
          angular.extend(grammar.morph, morph.attributes);
          updateGrammar(self.labels, grammar);
        }
        memo[id] = grammar;
      });
    };

    function morphHasChanged(a, b) {
      return !angular.equals(a, b);
    }

    function createKey(arg) {
      return arg.toUpperCase();
    }

    function updateGrammar(labels, grammar) {
      grammarReset(grammar);
      findDefiningAttributes(self.labels, grammar);
      extractMenu(grammar);
    }

    function findDefiningAttributes(labels, grammar ) {
      arethusaUtil.inject(grammar.definingAttrs, labels, function(memo, label, val) {
        var dep = val.dependency;
        if (dep) {
          var morph = grammar.morph;
          var nextLevel;
          angular.forEach(dep, function(depVal, depCat) {
            if (morph[depCat] === depVal) {
              memo.push(val);
              nextLevel = val.nested || {};
              findDefiningAttributes(nextLevel, grammar);
            }
          });
        }
      });
    }

    // We already captured the defining attributes at this point - they
    // are all stored as full objects with their full nested structure.
    // The menu we want to present to the user is therefore the last one
    // in this array structure.
    function extractMenu(grammar) {
      var attrs = grammar.definingAttrs;
      // Could be that this array is empty!
      var lastAttr = attrs[attrs.length - 1] || {};
      grammar.menu = lastAttr.nested || {};
    }

    this.init = function() {
      configure();
      self.grammar = createInternalState();
    };
  }
]);
