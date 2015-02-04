"use strict";

/**
 * @ngdoc service
 * @name arethusa.core.StateChange
 *
 * @description
 * Returns a constructor function, which is `new`'ed during a
 * the execution {@link arethusa.core.state#methods_change state.change}.
 *
 * Generally not meant to be executed by hand. The resulting object
 * is the third argument to the callback registered through a call
 * of {@link arethusa.core.state#methods_watch state.watch}.
 *
 * @property {Token} token The token object, which has been changed.
 * @property {String} property The property which has changed, e.g. `'head.id'`
 * @property {*} newVal New value of the `property` after the change
 * @property {*} oldVal Old value of the `property` before the change
 * @property {Date} time Time when the change has happened
 * @property {fn} undoFn Function to undo a change. Typically triggers another
 *   {@link arethusa.core.state#methods_change state.change} call.
 * @property {fn} exec Function to trigger the change - setting the `newVal`
 *   on the `property` of the `token`.
 *
 *   Broadcasts a `tokenChange` event on the `$rootScope` with itself
 *   (the `StateChange` object) as argument and notifies all listeners
 *   registered through {@link arethusa.core.state#methods_watch state.watch}.
 *
 *   Returns itself.
 *
 */
angular.module('arethusa.core').factory('StateChange', [
  '$parse',
  function($parse) {
    function getToken(state, tokenOrId) {
      if (angular.isObject(tokenOrId)) {
        return tokenOrId;
      } else {
        return state.getToken(tokenOrId);
      }
    }

    return function(state, tokenOrId, property, newVal, undoFn, preExecFn) {
      var self = this;

      var get = $parse(property);
      var set = get.assign;

      this.token = getToken(state, tokenOrId);
      this.property = property;
      this.newVal = newVal;
      this.oldVal = get(self.token);
      this.type   = 'change';
      this.time = new Date();

      function inverse() {
        state.change(self.token, property, self.oldVal);
      }

      this.undo   = function() {
        return angular.isFunction(undoFn) ? undoFn() : inverse();
      };

      this.exec   = function() {
        if (angular.isFunction(preExecFn)) preExecFn();

        set(self.token, self.newVal);

        // It might seem redundant to broadcast this event, when listeners
        // could just use state.watch().
        // But it's not: Depending the time of init, a listener might not
        // have the chance to inject state - he has to listen through a
        // $scope then. In addition, $on brings some additional info about
        // the scope in use etc., which might be handy at times. We won't
        // replicate this in state.watch(), as most of the time it's overkill.
        state.broadcast('tokenChange', self);
        state.notifyWatchers(self);

        return self;
      };
    };
  }
]);
