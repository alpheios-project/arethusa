"use strict";

angular.module('arethusa.sg').service('sg', [
  'state',
  'configurator',
  '$cacheFactory',
  'plugins',
  'notifier',
  function(state, configurator, $cacheFactory, plugins, notifier) {
    var self = this;
    this.name = 'sg';

    var retriever;
    this.labelAs = "long";
    this.defineAncestors = true;

    var sgCache = $cacheFactory('sg', { number:  100 });

    this.defaultConf = {
      displayName: "SG"
    };

    function configure() {
      configurator.getConfAndDelegate(self, ['labels']);
      retriever = configurator.getRetriever(self.conf.retriever);
    }

    function SgTemplate() {
      var self = this;

      this.morph = {};
      this.ancestors = [];
      this.definingAttrs = [];
      this.menu = {};
      this.hasChanged = true;
      this.isSgTemplate = true;
      this.markChange = function() {
        self.hasChanged = true;
      };
    }

    function grammarReset(grammar) {
      arethusaUtil.empty(grammar.ancestors);
      // We have to redefine this property - it's untouchable now
      // that it's cached!
      grammar.definingAttrs = [];
    }

    function sgFromStateComplete(sg) {
      return sg && sg.isSgTemplate;
    }

    function sgFromRetriever(sg) {
      return sg && sg.ancestors && !sg.isTemplate;
    }

    function createNewSgObject(token) {
      var grammar = new SgTemplate();
      var morph = token.morphology || {};
      grammar.string = token.string;
      checkAndUpdateGrammar(morph, grammar);
      return grammar;
    }

    function createInternalState() {
      // 3 possibilites here:
      //
      // 1 When we have seen this token set before, we don't need to do anything
      //   and can take the info we already created earlier in time.
      // 2 We have not seen the tokens, but they have info from the retrieved
      //   document. In such a case we build a new SgTemplate and add the sg
      //   ancestors from the token to it.
      // 3 We have to start from scratch.
      return arethusaUtil.inject({}, state.tokens, function(memo, id, token) {
        var grammar;
        var fromState = token.sg;
        if (sgFromStateComplete(fromState)) {
          grammar = fromState;
        } else {
          grammar = createNewSgObject(token);
          if (sgFromRetriever(fromState)) {
            addAncestorsFromState(fromState, grammar);
          }
        }
        memo[id] = grammar;
      });
    }

    function sgParseError(str, ancs, anc) {
      var ancsString = ancs.join(' ');
      return "Failed to parse SG annotation (in " + ancsString+ " at " + anc + " for " + str + ")";
    }

    var sgIncompatibilityWarning = "You might be using an incompatible version of the SG tagset";

    function addAncestorsFromState(sg, grammar) {
      var ancestors = sg.ancestors;
      var menu = grammar.menu;
      angular.forEach(ancestors, function(ancestor, i) {
        if (menu) {
          // The || menu.nested party is very hacky, but effective.
          // It can appear in menus that show a morph preselection -
          // I guess... Check a word with a dative proper e.g.
          var expandedAncestor = menu[ancestor] || menu.nested;
          if (!expandedAncestor) {
            notifier.error(sgParseError(grammar.string, ancestors, ancestor));
            notifier.warning(sgIncompatibilityWarning);
            menu = undefined;
            return;
          }
          grammar.ancestors.push(expandedAncestor);
          menu = expandedAncestor.nested;
        }
      });
    }

    var hint = "Please select a morphological form first!";

    this.currentGrammar = function() {
      return arethusaUtil.inject({}, state.selectedTokens, function(memo, id, event) {
        var morph = state.tokens[id].morphology;
        var grammar = self.grammar[id];
        if (grammar) {
          if (morph && morph.attributes) {
            delete grammar.hint;
            checkAndUpdateGrammar(morph, grammar);
          } else {
            grammarReset(grammar);
            grammar.morph = {};
            grammar.hint = hint;
          }
          memo[id] = grammar;
        }
      });
    };

    function morphHasChanged(a, b) {
      return !angular.equals(a, b);
    }

    function checkAndUpdateGrammar(morph, grammar) {
      if (morphHasChanged(grammar.morph, morph.attributes)) {
        // Need to empty first, otherwise we might mix attributes
        // of various part of speech types together!
        arethusaUtil.empty(grammar.morph);
        angular.extend(grammar.morph, morph.attributes);
        updateGrammar(self.labels, grammar);
      }
      return grammar;
    }

    function updateGrammar(labels, grammar) {
      grammarReset(grammar);
      findDefiningAttributes(self.labels, grammar, grammar.definingAttrs);
      extractMenu(grammar);
      cacheUpdateProcess(grammar);
      grammar.markChange();
    }

    function cacheUpdateProcess(grammar) {
      var key = cacheKey(grammar);
      if (!sgCache.get(key)) {
        sgCache.put(key, grammar.definingAttrs);
      }
    }

    function cacheKey(grammar) {
      return arethusaUtil.inject([], grammar.morph, function(memo, k, v) {
        memo.push(k + '-' + v);
      }).sort().join('|');
    }

    function findDefiningAttributes(labels, grammar, target) {
      var cached = sgCache.get(cacheKey(grammar));
      if (cached) {
        arethusaUtil.pushAll(target, cached);
      } else {
        arethusaUtil.inject(target, labels, function(memo, label, val) {
          var dep = val.dependency;
          if (dep) {
            var morph = grammar.morph;
            var nextLevel;
            angular.forEach(dep, function(depVal, depCat) {
              if (dependencyMet(morph[depCat], depVal)) {
                val = angular.copy(val);
                memo.push(val);
                nextLevel = val.nested;
                if (nextLevel) {
                  angular.forEach(nextLevel, function(nestedMenu, nestedLabel) {
                    if (nestedMenu.nestedDependency) {
                      var nextNestedLevel = [];
                      findDefiningAttributes(nestedMenu.nested, grammar, nextNestedLevel);
                      nestedMenu.nested = { nested: nextNestedLevel.pop() };
                    }
                  });
                  findDefiningAttributes(nextLevel, grammar, target);
                }
              }
            });
          }
        });
      }
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
      grammar.menu = lastAttr.nested;
    }

    function propagateToState() {
      angular.forEach(self.grammar, function(val, id) {
        state.tokens[id].sg = val;
      });
    }

    this.requestGrammar = function(sections, callback) {
      retriever.getData(sections, callback);
    };

    this.canEdit = function() {
      return self.mode === "editor";
    };

    state.on('tokenAdded', function(event, token) {
      self.grammar[token.id] = createNewSgObject(token);
    });

    state.on('tokenRemoved', function(event, token) {
      delete self.grammar[token.id];
    });

    this.init = function() {
      plugins.doAfter('morph', function() {
        configure();
        self.grammar = createInternalState();
        self.readerRequested = false;
        propagateToState();
      });
    };
  }
]);
