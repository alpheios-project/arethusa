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

    return function(state, tokenOrId, property, newVal, undoFn) {
      var self = this;

      this.token = getToken(state, tokenOrId);
      this.property = property;
      this.get = $parse(property);
      this.set = self.get.assign;
      this.newVal = newVal;
      this.oldVal = self.get(self.token);
      this.time = new Date();

      function inverse() {
        var inv = state.change(self.token, property, self.oldVal);
        inv.exec();
        return inv;
      }

      this.undo   = function() {
        return angular.isFunction(undoFn) ? undoFn : inverse;
      };

      this.exec   = function() {
        self.set(self.token, self.newVal);
      };
    };
  }
]);
