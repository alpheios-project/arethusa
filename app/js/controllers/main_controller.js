"use strict";

annotationApp.controller('MainController', function($scope, state, configurator) {
  var conf = configurator.conf_for('MainController');

  $scope.partitionPlugins = function() {
    $scope.mainPlugins = [];
    $scope.subPlugins = [];

    angular.forEach(conf.plugins, function(el, name) {
      if (el.main) {
        $scope.mainPlugins.push(name);
      } else {
        $scope.subPlugins.push(name);
      }
    });
  };

  $scope.addPlugin = function() {
    $scope.plugins.push("comment");
  };

  $scope.loadPlugin = function(plugin, path) {
    configurator.loadPlugin(plugin, path);
    $scope.partitionPlugins();
  };

  $scope.availableConfs = configurator.listAvailableConfs();

  $scope.state = state;
  $scope.plugins = function () {
    var res = [];
    for (var key in conf.plugins) {
      var value = conf.plugins[key];
      res.push(value);
    }
    return res;
  };
//  $scope.loadPlugin("text", './static/text_conf.json');
//  $scope.loadPlugin("morph");

  $scope.partitionPlugins();
  $scope.template = conf.template;

  $scope.switchTemplate = function() {
    if ($scope.template === "templates/main.html") {
      $scope.template = "templates/main2.html";
    } else {
      $scope.template = "templates/main.html";
    }
  };
});
