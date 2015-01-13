'use strict';
/**
 * @ngdoc service
 * @name arethusa.core.Highlighter
 * @description
 * # Highlighter
 * Provides functions apply or unapply a given highlighting style
 * to matching tokens of a given StateChangeWatcher.
 *
 * @requires arethusa.core.state
 * @requires arethusa.core.StateChangeWatcher
 */
angular.module('arethusa.core').factory('Highlighter', [
  'state',
  function (state) {
    return function(stateChangeWatcher, style) {
      var self = this;

      this.applyHighlighting = function() {
        stateChangeWatcher.applyToMatching(function(id) {
          state.addStyle(id, style);
        });
      };

      this.removeStyle = function(id) {
        var styles = Object.keys(style);
        state.removeStyle(id, styles);
      };

      this.unapplyHighlighting = function() {
        stateChangeWatcher.applyToMatching(function(id) {
          self.removeStyle(id);
        });
      };
    };
  }
]);
