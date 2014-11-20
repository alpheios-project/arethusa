"use strict";

angular.module('arethusa.constituents').directive('constituencyTree', [
  'Tree',
  function (Tree) {
    return {
      restrict: 'A',
      scope: {
        tokens: '=',
        styles: '='
      },
      link: function (scope, element, attrs) {
        var tree = new Tree(scope, element);
        tree.launch();
      },
    };
  }
]);
