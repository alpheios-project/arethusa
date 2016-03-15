'use strict';
angular.module('arethusa.core').controller('NavigatorCtrl', [
  '$scope',
  'navigator',
  'translator',
  'keyCapture',
  function ($scope, navigator, translator, keyCapture) {
    $scope.next = function () {
      navigator.nextChunk();
    };
    $scope.prev = function () {
      navigator.prevChunk();
    };
    $scope.goToFirst = function() {
      navigator.goToFirst();
    };
    $scope.goToLast = function() {
      navigator.goToLast();
    };
    $scope.goTo = function(id) {
      navigator.goTo(id);
    };
    $scope.nav = navigator;

    $scope.$watch('nav.status', function(newVal, oldVal) {
      $scope.navStat = newVal;
    });

    // Converts an array of ids to something more readable, e.g.
    // [ 1, 2, 3, 4, 6, 8, 9] becomes 1-4, 6, 8-9
    function formatIds(ids) {
      var res =   [];
      var range = [];
      res.push(range);

      if (ids) {
        angular.forEach(ids, function(id, i) {
          var last = aU.last(range);
          if (!last || parseInt(last) + 1 === parseInt(id)) {
            range.push(id);
          } else {
            range = [id];
            res.push(range);
          }
        });
      }

      return arethusaUtil.map(res, function(range) {
        if (range.length > 1) {
          var first = range[0];
          var last  = range[1];
          return first + '-' + last;
        } else {
          return range[0];
        }
      }).join(', ');
    }

    $scope.$watchCollection('navStat.currentIds', function(newVal, oldVal) {
      if (newVal) {
        $scope.ids = formatIds(newVal);
      }
    });

    $scope.trsls = translator({
      'navigator.goToNext': 'goToNext',
      'navigator.goToPrev': 'goToPrev',
      'navigator.goToFirst': 'goToFirst',
      'navigator.goToLast': 'goToLast',
      'list': 'list'
    });

    $scope.keys = {};
    $scope.$watch('nav.keys', function(newValue) {
      if (newValue) {
        $scope.keys.nextChunkKey = aU.formatKeyHint(newValue.navigation.nextChunk);
        $scope.keys.prevChunkKey = aU.formatKeyHint(newValue.navigation.prevChunk);
        $scope.keys.listKey = aU.formatKeyHint(newValue.navigation.list);
      }
    });
  }
]);
