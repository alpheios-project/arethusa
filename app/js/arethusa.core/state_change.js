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

      this.token = getToken(state, tokenOrId);
      this.property = property;
      this.get = $parse(property);
      this.set = self.get.assign;
      this.newVal = newVal;
      this.oldVal = self.get(self.token);
      this.time = new Date();

      function inverse() {
        state.change(self.token, property, self.oldVal);
      }

      this.undo   = function() {
        return angular.isFunction(undoFn) ? undoFn : inverse;
      };

      this.exec   = function() {
        if (angular.isFunction(preExecFn)) preExecFn();

        self.set(self.token, self.newVal);
        return self;
      };
    };
  }
]);
