"use strict";

angular.module('arethusa.relation').directive('nestedMenuCollection', [
  '$window',
  function($window) {
    return {
      restrict: 'A',
      replace: 'true',
      scope: {
        current: '=',
        all: '=',
        property: '=',
        ancestors: '=',
        emptyVal: '@',
        labelAs: "=",
      },
      link: function(scope, element, attrs) {
        var win = angular.element($window);

        scope.emptyLabel = "";
        scope.emptyObj = {};

        scope.labelView = function(labelObj) {
          if (scope.labelAs) {
            return labelObj[scope.labelAs];
          } else {
            return labelObj.short;
          }
        };

        if (element.hasClass('top-menu')) {
          var items = Object.keys(scope.all || {}).length + 1; // an empty val
          // Don't try to be clever when the list is really long. Chances are
          // that repositioning would cause the menu to go beyond the upper
          // border of the viewport, which is even worse.
          if (items < 15) {
            var menuHeight = items * 18; // hard to access, we therefore hardcode...
            var maxHeight = win.height() - 15;
            var topPos = element.parent().offset().top;
            var bottom = topPos + menuHeight;
            if (bottom > maxHeight) {
              element.css({ top: 'auto', bottom: '100%'});
            }
          }
        }
      },
      template: '\
        <ul>\
          <li ng-if="emptyVal"\
            nested-menu\
            property="property"\
            rel-obj="current"\
            ancestors="ancestors"\
            label="emptyLabel"\
            label-obj="emptyObj">\
          </li>\
          <li\
            ng-repeat="label in all | keys"\
            nested-menu\
            property="property"\
            rel-obj="current"\
            ancestors="ancestors"\
            label="labelView(all[label])"\
            label-as="labelAs"\
            label-obj="all[label]">\
          </li>\
        </ul>\
      '
    };
  }
]);
