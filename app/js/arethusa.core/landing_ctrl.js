"use strict";

angular.module('arethusa.core').controller('LandingCtrl', [
  '$scope',
  '$window',
  function ($scope, $window) {
    $scope.template = 'templates/landing_page.html';

    var imgPath = '../dist/examples/images/';


    function Example(name, caption, img, url) {
      this.name = name;
      this.caption = caption;
      this.img = imgPath + img;
      this.url = '#/' + url;
    }

    function UseCase(name, examples) {
      this.name = name;
      this.examples = examples;
    }

    function Partner(name, img, href) {
      this.name = name;
      this.img = imgPath + img;
      this.href = href;
    }

    $scope.useCases = [
      new UseCase('Treebanking', [
        new Example('Dependency Trees', '', 'create1.png', 'example_tb_create?doc=athenaeus12'),
        new Example('Review', '', 'tb_review.png', 'example_tb_review?doc=11&gold=1'),
        new Example('Try it yourself!', '', 'create2.png', 'example_tb_create?doc=clean')
      ]),
      //new UseCase('Reading Environmnent', [])
    ];

    $scope.partners = [
      new Partner('DH Leipzig', 'dh_logo.png', 'http://www.dh.uni-leipzig.de'),
      new Partner('Perseids', 'perseids_logo.png', 'http://sites.tufts.edu/perseids'),
      new Partner('Alpheios', 'alpheios_logo.png', 'http://www.alpheios.net')
    ];

    $scope.goTo = function(url) {
      $window.open(url);
    };
  }
]);
