"use strict";

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
        state.notifiyWatchers(self);

        return self;
      };
    };
  }
]);
