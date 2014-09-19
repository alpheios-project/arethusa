"use strict";

angular.module('arethusa.core').controller('LandingCtrl', [
  '$scope',
  '$window',
  function ($scope, $window) {
    $scope.template = 'templates/landing_page.html';


    function Example(name, caption, img, url) {
      this.name = name;
      this.caption = caption;
      this.img = '../dist/examples/images/' + img;
      this.url = '/app/#/' + url;
    }

    function UseCase(name, examples) {
      this.name = name;
      this.examples = examples;
    }

    $scope.useCases = [
      new UseCase('Treebanking', [
        new Example('Dependency Trees', '', 'create1.png', 'example_tb_create?doc=athenaeus12'),
        new Example('Review', '', 'tb_review.png', 'example_tb_review?doc=11&gold=1'),
        new Example('Try it yourself!', '', 'create2.png', 'example_tb_create?doc=clean')
      ]),
      //new UseCase('Reading Environmnent', [])
    ];

    $scope.goTo = function(url) {
      $window.open(url);
    };
  }
]);
