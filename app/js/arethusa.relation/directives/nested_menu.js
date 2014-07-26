"use strict";

angular.module('arethusa.relation').directive('nestedMenu', [
  '$compile',
  'relation',
  '$timeout',
  'saver',
  function($compile, relation, $timeout, saver) {
    return {
      restrict: 'A',
      scope: {
        relObj: '=',
        labelObj: '=',
        label: '=',
        labelAs: '=',
        property: '=',
        ancestors: '='
      },
      link: function(scope, element, attrs) {
        var html = '\
          <ul\
            nested-menu-collection\
            current="relObj"\
            property="property"\
            ancestors="ancestors"\
            label-as="labelAs"\
            all="labelObj.nested">\
          </ul>\
        ';

        scope.labelRepresentation = scope.label ? scope.label : '---';

        if (scope.labelObj.nested) {
          element.append($compile(html)(scope));
          element.addClass('nested');
        }

        scope.selectLabel = function() {
          if (scope.property) {
            scope.relObj[scope.property] = scope.label;
            relation.buildLabel(scope.relObj);
          }
        };

        scope.addAncestor = function(obj, ancestor) {
          obj.ancestors.unshift(ancestor);
        };

        scope.resetAncestors = function(obj) {
          var ancestors = obj.ancestors;
          while (ancestors.length > 0) {
            ancestors.pop();
          }
        };

        function markChange() {
          if (angular.isFunction(scope.relObj.markChange)) {
            scope.relObj.markChange();
          }
        }

        element.bind('click', function(event) {
          scope.$apply(function() {
            // Temporary solution. Eventually we want to trigger a tokenChange
            // event here, so that other plugins can listen to it. This event
            // would also notifiy the saver that a save is needed.
            saver.needsSave = true;

            if (event.eventPhase === 2) { // at target, three would be bubbling!
              markChange();
              scope.selectLabel();
              if (scope.ancestors) {
                scope.resetAncestors(scope.relObj);
              }
            }
            if (scope.ancestors) {
              scope.addAncestor(scope.relObj, scope.labelObj);
            }
          });
        });


        var p = angular.element(document.getElementById('sidepanel'));
        var leftDistance;
        if (scope.labelObj.nested) {
          element.on('mouseenter', function() {
            // This is pretty crazy to do really right. We add a timeout so that
            // we can still blaze through the list without triggering scroll
            // events all the time. For that we have to check that when the
            // timeout is run out we're still hovering the element.
            $timeout(function() {
              if (element.is(':hover')) {
                var domPanel = p[0];
                var totalW = p.width();
                var leftScroll = element.scrollLeft();
                var leftDistance = domPanel.scrollWidth - leftScroll - totalW;
                if (leftDistance > 0) {
                  p.scrollLeft(leftScroll + leftDistance, 500);
                }
              }
            }, 500);
          });
          // Would be nice to get back somehow too. Sadly, the event only fires
          // when the whole menu is left - which makes no sense...
          // It's logically also not very sound - work on this later.
          //element.on('mouseleave', function() {
            //if (leftDistance > 0) {
              //console.log(element.scrollLeft());
              //p.scrollLeft(element.scrollLeft() - leftDistance, 500);
            //}
          //});
        }
      },
      template: '{{ labelRepresentation }}'
    };
  }
]);
