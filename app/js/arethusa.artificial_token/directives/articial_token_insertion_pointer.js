"use strict";

angular.module('arethusa.artificialToken').directive('artificialTokenInsertionPointer', [
  'artificialToken',
  'state',
  function(artificialToken, state) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var aT = artificialToken;
        var modeClass = 'crosshair-cursor';
        var selectMode;
        var watch;
        scope.insertionPoint;

        function tokens() {
          return angular.element('[token]');
        }

        scope.state = state;
        scope.insertionPointSet = true;
        scope.text = '-';

        scope.enterSelectMode = function() {
          selectMode = true;
          state.deselectAll();
          tokens().addClass(modeClass);
          setWatch();
        };

        function leaveSelectMode() {
          selectMode = false;
          tokens().removeClass(modeClass);
          watch(); // to deregister
        }

        function setInsertionPoint(id) {
           scope.insertionPoint = state.getToken(id);
           artificialToken.model.insertionPoint = scope.insertionPoint;
        }

        function setWatch() {
          watch = scope.$watchCollection('state.selectedTokens', function(newVal, oldVal) {
            for (var id in newVal) {
              if (newVal[id] === 'click') {
                setInsertionPoint(id);
                state.deselectAll();
                leaveSelectMode();
                break;
              }
            }
          }, true);
        }


        scope.select = function() {

        };

      },
      templateUrl: 'templates/arethusa.artificial_token/artificial_token_insertion_pointer.html'
    };
  }
]);
