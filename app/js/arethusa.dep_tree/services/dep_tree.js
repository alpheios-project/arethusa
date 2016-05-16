'use strict';
/* Dependency Tree Handler with Diff capabilities
 *
 * This service has not much to do - the tree itself is handled
 * completely by the dependencyTree directive.
 *
 * It has however additional diff capabilities, that are triggered
 * by a global diffLoaded event.
 * Knows how to pass style information to the tree visualization in
 * case a comparison/review was done.
 * * One could experiment here that this code should go back to a diff plugin
 * itself.
 * A diff plugin would calculate style information and pass this data load
 * through the diffLoaded event. The depTree service would listen to this
 * and pass the style info to its tree.
 *
 * Let's wait on a decision for this until we have done more work on the
 * diff plugin itself and resolved issue #80.
 * (https://github.com/latin-language-toolkit/llt-annotation_environment/issues/80)
 */
angular.module('arethusa.depTree').service('depTree', [
  'state',
  'configurator',
  'globalSettings',
  'notifier',
  'translator',
  'idHandler',
  function (state, configurator, globalSettings, notifier, translator, idHandler) {
    var self = this;
    this.name = "depTree";

    this.externalDependencies = {
      ordered: [
        "https://cdnjs.cloudflare.com/ajax/libs/d3/3.4.13/d3.js",
        "http://localhost:8090/vendor/dagre-d3/dagre-d3.min.js"
      ]
    };

    function configure() {
      configurator.getConfAndDelegate(self);
      self.diffMode = false;
      self.diffPresent = false;
      self.diffInfo = {};
    }

    this.toggleDiff = function () {
      self.diffMode = !self.diffMode;
    };

    // We have three things we can colorize as wrong in the tree
    //   Label
    //   Head
    //   and the word itself for morphological stuff
    function analyseDiffs(tokens) {
      return arethusaUtil.inject({}, tokens, function (memo, id, token) {
        var diff = token.diff;
        if (diff) {
          memo[id] = analyseDiff(diff);
        }
      });
    }

    function analyseDiff(diff) {
      return arethusaUtil.inject({}, diff, function (memo, key, val) {
        if (key === 'relation') {
          memo.label = { color: 'red' };
        } else {
          if (key === 'head') {
            memo.edge = {
              stroke: 'red',
              'stroke-width': '1px'
            };
          } else {
            memo.token = { color: 'red' };
          }
        }
      });
    }

    this.diffStyles = function () {
      if (self.diffMode) {
        return self.diffInfo;
      } else {
        return false;
      }
    };

    state.on('diffLoaded', function () {
      self.diffPresent = true;
      self.diffInfo = analyseDiffs(state.tokens);
      self.diffMode = true;
    });

    function addMissingHeadsToState() {
      angular.forEach(state.tokens, addHead);
    }

    function addHead(token) {
      if (!token.head) token.head = {};
    }

    function hasHead(token) {
      return token.head.id;
    }

    state.on('tokenAdded', function(event, token) {
      addHead(token);
    });

    state.on('tokenRemoved', function(event, token) {
      // We need to disconnect manually, so that this event
      // can be properly undone.
      if (hasHead(token)) self.disconnect(token);
      var id = token.id;
      angular.forEach(state.tokens, function(t, i) {
        if (t.head.id === id) {
          self.disconnect(t);
        }
      });
    });

    // Used inside the context menu
    this.disconnect = function(token) {
      state.change(token, 'head.id', '');
    };

    this.toRoot = function(token) {
      var rootId = idHandler.getId('0', token.sentenceId);
      state.change(token, 'head.id', rootId);
    };

    function getHeadsToChange(token) {
      var sentenceId = token.sentenceId;
      var id  = token.id;
      var notAllowed;
      var res = [];
      for (var otherId in state.clickedTokens) {
        var otherToken = state.getToken(otherId);
        if (otherToken.sentenceId !== sentenceId) {
          notAllowed = true;
          break;
        }
        if (id !== otherId) {
          res.push(otherToken);
        }
      }
      return notAllowed ? 'err': (res.length ? res : false);
    }

    function changeHead(tokenToChange, targetToken) {
      if (isDescendant(targetToken, tokenToChange)) {
        state.change(targetToken, 'head.id', tokenToChange.head.id);
      }
      state.change(tokenToChange, 'head.id', targetToken.id);
    }

    function isDescendant(targetToken, token) {
      var current = targetToken;
      var currHead = aU.getProperty(current, 'head.id');
      var tokenId = token.id;
      var desc = false;
      while ((!desc) && current && currHead) {
        if (tokenId === currHead) {
          desc = true;
        } else {
          current = state.getToken(currHead);
          currHead = current ? aU.getProperty(current, 'head.id') : false;
        }
      }
      return desc;
    }

    var translations = {};
    translator('depTree.errorAcrossSentences', translations, 'errorAcrossSentences');

    this.changeHead = function(idOrToken) {
      var token = angular.isString(idOrToken) ? state.getToken(idOrToken) : idOrToken;
      var headsToChange = getHeadsToChange(token);
      if (headsToChange) {
        if (headsToChange === 'err') {
          notifier.error(translations.errorAcrossSentences);
          return;
        }
        state.doBatched(function() {
          angular.forEach(headsToChange, function(otherToken, i) {
            changeHead(otherToken, token);
          });
        });
        return true;
      } else {
        return false;
      }
    };

    function changeHeadAction(id) {
      var headHasChanged = self.changeHead(id);
      if (!headHasChanged) {
        globalSettings.defaultClickAction(id);
      }
    }

    function awaitingHeadChange(id, event) {
      return !state.isSelected(id) && state.hasClickSelections() && !event.ctrlKey;
    }

    function preHeadChange() {
      return {
        'mouseenter' : function(id, element, event) {
          if (awaitingHeadChange(id, event)) {
            element.addClass('copy-cursor');
          }
        },
        'mouseleave' : function(id, element, event) {
          element.removeClass('copy-cursor');
        }
      };
    }

    var clickActionName = 'change head';

    globalSettings.addClickAction(clickActionName, changeHeadAction, preHeadChange());
    globalSettings.deselectAfterAction('head.id');

    this.init = function () {
      configure();
      addMissingHeadsToState();

      if (self.mode === 'editor') {
        globalSettings.setClickAction(clickActionName);
      }
    };
  }
]);
