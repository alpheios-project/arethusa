"use strict";

angular.module('arethusa.sg').service('sg', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    var retriever;
    this.labelAs = "long";
    this.defineAncestors = true;

    function configure() {
      configurator.getConfAndDelegate('sg', self, ['labels']);
      retriever = configurator.getRetriever(self.conf.retriever);
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
        var grammar = sgTemplate();
        var morph = token.morphology || {};
        grammar.string = token.string;
        checkAndUpdateGrammar(morph, grammar);
        addAncestorsFromState(token.sg, grammar);
        memo[id] = grammar;
      });
    }

    function addAncestorsFromState(sg, grammar) {
      if (!sg) return;

      var ancestors = sg.ancestors || [];
      var target = grammar.ancestors;
      var menu = grammar.menu;
      angular.forEach(ancestors, function(ancestor, i) {
        var el = menu[ancestor];
        target.push(el);
        menu = el.nested;
      });
    }

    this.currentGrammar = function() {
      return arethusaUtil.inject({}, state.selectedTokens, function(memo, id, event) {
        var morph = state.tokens[id].morphology || {};
        var grammar = self.grammar[id];
        checkAndUpdateGrammar(morph, grammar);
        memo[id] = grammar;
      });
    };

    function morphHasChanged(a, b) {
      return !angular.equals(a, b);
    }

    function checkAndUpdateGrammar(morph, grammar) {
      if (morphHasChanged(grammar.morph, morph.attributes)) {
        angular.extend(grammar.morph, morph.attributes);
        updateGrammar(self.labels, grammar);
      }
      return grammar;
    }

    function updateGrammar(labels, grammar) {
      grammarReset(grammar);
      findDefiningAttributes(self.labels, grammar, grammar.definingAttrs);
      extractMenu(grammar);
    }

    function findDefiningAttributes(labels, grammar, target) {
      arethusaUtil.inject(target, labels, function(memo, label, val) {
        var dep = val.dependency;
        if (dep) {
          var morph = grammar.morph;
          var nextLevel;
          angular.forEach(dep, function(depVal, depCat) {
            // More a hack than a solution so far, through
            // the RegExp we can match "1st2nd3rd" of the
            // pers dep. So far all works, but the RegExp
            // could cause trouble, when wrong dependency
            // values match...
            if (dependencyMet(morph[depCat], depVal)) {
              val = angular.copy(val);
              memo.push(val);
              nextLevel = val.nested || {};
              angular.forEach(nextLevel, function(nestedMenu, nestedLabel) {
                if (nestedMenu.nestedDependency) {
                  var nextNestedLevel = [];
                  findDefiningAttributes(nestedMenu.nested, grammar, nextNestedLevel);
                  nestedMenu.nested = { nested: nextNestedLevel.pop() };
                }
              });
              findDefiningAttributes(nextLevel, grammar, target);
            }
          });
        }
      });
    }

    function dependencyMet(morphValue, depValue) {
      if (angular.isDefined(morphValue)) {
        return morphValue === depValue || depValue === "*";
      }
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

    function propagateToState() {
      angular.forEach(self.grammar, function(val, id) {
        state.tokens[id].sg = val;
      });
    }

    this.requestGrammar = function(sections, callback) {
      retriever.getData(sections, callback);
    };

    this.init = function() {
      configure();
      self.grammar = createInternalState();
      self.readerRequested = false;
      propagateToState();
    };
  }
]);
