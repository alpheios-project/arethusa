"use strict";

angular.module('arethusa.core').controller('LandingCtrl', [
  '$scope',
  '$window',
  function ($scope, $window) {
    $scope.template = 'templates/landing_page.html';


    function Example(name, caption, url) {
      this.name = name;
      this.caption = caption;
      this.url = url;
    }

    $scope.useCases = {
      Treebanking: [
        new Example('...', '', 'example_tb_create?doc=athenaeus1'),
        new Example('Review', '', 'example_tb_review?doc=11&gold=1'),
        new Example('...', '', 'example_tb_create?doc=clean'),
      ]
    };

    $scope.goTo = function(url) {
      $window.open('/app/#/' + url);
    };
  }
]);
