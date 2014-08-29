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
  function (state, configurator) {
    var self = this;

    this.externalDependencies = [
      "../bower_components/d3/d3.min.js",
      "../vendor/dagre-d3/dagre-d3.min.js"
    ];

    function configure() {
      configurator.getConfAndDelegate('depTree', self);
      self.diffMode = false;
      self.diffPresent = false;
      self.diffInfo = {};
    }

    configure();

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
      state.change(token, 'head.id', '0000');
    };

    this.init = function () {
      configure();
      addMissingHeadsToState();
    };
  }
]);
