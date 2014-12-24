'use strict';

app.controller('BrowserController', [
  '$scope',
  'FetchFileFactory',
  function($scope, FetchFileFactory) {
    function isTreebank(node) {
      return node.id.match(/examples\/data\/treebanks\/.*\.xml$/);
    }

    function generateTreebankLink(node) {
      var base = '../app/#/staging?doc=';
      var docId = node.text.match(/(.*)\.xml/)[1];

      $scope.arethusaHref = base + docId;
    }

    function unsetTreebankLink() {
      $scope.arethusaHref = undefined;
    }



    $scope.fileViewer = 'Please select a file to view its contents';

    $scope.nodeSelected = function(e, data) {
      var node = data.node;
      var _l = node.li_attr;

      if (isTreebank(node)) {
        generateTreebankLink(node);
      } else {
        unsetTreebankLink();
      }

      if (_l.isLeaf) {
        FetchFileFactory.fetchFile(_l.base).then(function(data) {
          var _d = data.data;
          if (typeof _d == 'object') {

            //http://stackoverflow.com/a/7220510/1015046//
            _d = JSON.stringify(_d, undefined, 2);
          }
          $scope.preview = true;
          $scope.fileViewer = _d;
        });
      } else {

        //http://jimhoskins.com/2012/12/17/angularjs-and-apply.html//
        $scope.$apply(function() {
          $scope.fileViewer = 'Please select a file to view its contents';
          $scope.preview = false;
        });
      }
    };
  }
]);