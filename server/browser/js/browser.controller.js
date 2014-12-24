'use strict';

angular.module('fileBrowserApp').controller('BrowserController', [
  '$scope',
  'FetchFileFactory',
  function($scope, FetchFileFactory) {
    function isTreebank(node) {
      return node.id.match(/examples\/data\/treebanks\/.*\.xml$/);
    }

    function generateTreebankLink(node) {
      var base = '../app/#/staging?doc=';
      var docId = node.id.match(/treebanks\/(.*)\.xml/)[1];

      $scope.arethusaHref = base + docId;
    }

    function unsetTreebankLink() {
      $scope.arethusaHref = undefined;
    }

    var placeholder = 'Please select a file to view its contents';

    function toggleHighlighting(bool) {
      $scope.syntaxHighlighting = bool;
    }

    function checkHighlighting(file) {
      if (file.length < 50000) {
        toggleHighlighting(true);
      } else {
        toggleHighlighting(false);
      }
    }

    function checkForTreebankLink(node) {
      if (isTreebank(node)) {
        generateTreebankLink(node);
      } else {
        unsetTreebankLink();
      }
    }

    function fetchFile(file) {
      FetchFileFactory.fetchFile(file).then(function(data) {
        var _d = data.data;
        if (typeof _d == 'object') {
          //http://stackoverflow.com/a/7220510/1015046//
          _d = JSON.stringify(_d, undefined, 2);
        }
        $scope.fileViewer = _d;
        checkHighlighting(_d);
      });
    }

    function fetchStats(file) {
      FetchFileFactory.fetchStats(file).then(function(res) {
        $scope.fileStats = res.data;
      });
    }

    $scope.fileViewer = placeholder;

    $scope.nodeSelected = function(e, data) {
      var node = data.node;
      var _l = node.li_attr;

      if (_l.isLeaf) {
        fetchFile(_l.base);
        checkForTreebankLink(node);
      } else {
        //http://jimhoskins.com/2012/12/17/angularjs-and-apply.html//
        $scope.$apply(function() {
          toggleHighlighting(false);
          $scope.fileViewer = placeholder;
        });
      }
      fetchStats(_l.base);
    };
  }
]);
