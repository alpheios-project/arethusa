"use strict";

angular.module('arethusa.core').directive('relationItem', [
  '$compile',
  function($compile) {
    var TEMPLATE = [
      '<li',
        'dnd-draggable="item"',
        'dnd-moved="onItemMoved($index, event)"',
        'dnd-effect-allowed="move">',
        '<header>',
          '<input type="text" ng-model="item.short">',
          '<input type="text" ng-model="item.long">',
        '</header>',
        '<relation-item-list list="item.list"></relation-item-list>',
      '</li>'
    ].join(' ');
    return {
      restrict: 'EA',
      scope: {
        item: '='
      },
      link: function(scope, element, attrs) {
        scope.onItemMoved = onItemMoved;

        render();

        function render() {
          var content = $compile(TEMPLATE)(scope);
          element.append(content);
        }

        function onItemMoved(i, event) {
          angular.element(event.toElement).hide();
          scope.item.list.splice(i, 1);
        }
      }
    };
  }
]);
