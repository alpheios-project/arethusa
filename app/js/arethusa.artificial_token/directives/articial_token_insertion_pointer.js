"use strict";

angular.module('arethusa.artificialToken').directive('artificialTokenInsertionPointer', [
  'artificialToken',
  'state',
  'translator',
  function(artificialToken, state, translator) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        var modeClass = 'crosshair-cursor';
        var selectMode;
        var watch;

        scope.aT = artificialToken;

        var trsl = {};
        function updateAndTrigger(key) {
          return function(translation) {
            trsl[key] = translation();
            setInsertDirText();
          };
        }
        translator('aT.insertBehind',      updateAndTrigger('behind'));
        translator('aT.insertInFront',     updateAndTrigger('inFront'));
        translator('aT.insertBehindHint',  updateAndTrigger('behindHint'));
        translator('aT.insertInFrontHint', updateAndTrigger('inFrontHint'));

        function setInsertDirText() {
          var dir = scope.aT.insertBehind ? 'behind' : 'inFront';
          scope.insertDirText = trsl[dir];
          scope.insertDirHint = trsl[dir + 'Hint'];
          scope.arrow = scope.aT.insertBehind ? 'right' : 'left';
        }

        function tokens() {
          return angular.element('[token]');
        }

        scope.state = state;

        scope.enterSelectMode = function() {
          selectMode = true;
          state.deselectAll();
          tokens().addClass(modeClass);
          setWatch();
        };

        scope.toggleDir = function() {
          scope.aT.insertBehind = !scope.aT.insertBehind;
          setInsertDirText();
        };

        function leaveSelectMode() {
          selectMode = false;
          tokens().removeClass(modeClass);
          watch(); // to deregister
        }

        function setInsertionPoint(id) {
          artificialToken.model.insertionPoint = state.getToken(id);
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

        scope.$watch('aT.model.insertionPoint', function(newVal, oldVal) {
          scope.insertionPoint = newVal;
        });

        scope.$watch('aT.insertBehind', setInsertDirText);

        setInsertDirText();
      },
      templateUrl: 'templates/arethusa.artificial_token/artificial_token_insertion_pointer.html'
    };
  }
]);
