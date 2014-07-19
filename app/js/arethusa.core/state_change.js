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

    function buildMessage(token, property, newVal, oldVal) {
      // We should check here if newVal and oldVal are objects, otherwise
      // the user won't see anything helpful. Ideally these objects come
      // with a toString function we could check for?
      return "Changed " + property +" of " +
        token.string + " at " + token.id +
        " from " +oldVal +" to " + newVal;
    }

    return function(state, tokenOrId, property, newVal, undoFn, preExecFn) {
      var self = this;

      var get = $parse(property);
      var set = get.assign;

      this.token = getToken(state, tokenOrId);
      this.property = property;
      this.newVal = newVal;
      this.oldVal = get(self.token);
      this.time = new Date();

      this.message = buildMessage(self.token, self.property, self.newVal, self.oldVal);

      function inverse() {
        state.change(self.token, property, self.oldVal);
      }

      this.undo   = function() {
        return angular.isFunction(undoFn) ? undoFn() : inverse();
      };

      this.exec   = function() {
        if (angular.isFunction(preExecFn)) preExecFn();

        set(self.token, self.newVal);
        return self;
      };
    };
  }
]);
