'use strict';
angular.module('arethusa.core').service('StateChangeWatcher', [
  'state',
  function (state) {
    return function(propertyToWatch, checkFunction, newMatch, lostMatch) {
      var self = this;
      this.count = 0;
      this.matchingTokens = {};

      this.initCount = function() {
        angular.forEach(state.tokens, function(token) {
          if (!checkFunction(token)) {
            self.count++;
            self.matchingTokens[token.id] = true;
          }
        });
      };
      this.watchChange = function(newVal, oldVal, event) {
        console.log(event);
        var id = event.token.id;
        if (newVal) {
          // Check if the token was used before!
          if (!oldVal) {
            self.count--;
            delete self.matchingTokens[id];
            lostMatch(event.token);
          }
        } else {
          self.count++;
          self.matchingTokens[id] = true;
          newMatch(event.token);
        }
      };

      state.watch(propertyToWatch, this.watchChange);
    };
  }
]);
