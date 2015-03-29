"use strict";

angular.module('arethusa.core').directive('relationItemList', [
  function() {
    return {
      restrict: 'EA',
      scope: {
        list: '='
      },
      link: function(scope, element, attrs) {

      },
      templateUrl: 'templates/arethusa.tools/relation_item_list.html'
    };
  }
]);

