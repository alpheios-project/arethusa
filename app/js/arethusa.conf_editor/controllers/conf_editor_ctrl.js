'use strict';
angular.module('arethusa.confEditor').controller('ConfEditorCtrl', [
  '$scope',
  'configurator',
  'confUrl',
  'notifier',
  '$http',
  'logger',
  function ($scope, configurator, confUrl, notifier, $http, logger) {
    $scope.conf = configurator.getConfTemplate();
    $scope.filePath = '';
    // If we have specified a conf file to preload, we fetch it here
    // asynchronously.
    // As we have already set an empty confTemplate, the site can
    // start to render itself without errors before this is finished.
    $scope.loadFileToEdit = function () {
      var url = confUrl();
      if (url) {
        $http.get(url).then(function (res) {
          var conf = configurator.loadConfFile(res.data, url);
          $scope.conf = conf.data;
          $scope.filePath = conf.location;
        });
      }
    };
    $scope.debug = false;
    $scope.toggleDebugMode = function () {
      $scope.debug = !$scope.debug;
    };
    $scope.fileName = function () {
      return $scope.filePath.replace(/^.*configs\//, '');
    };
    // some delegators
    $scope.main = function () {
      return $scope.conf.main;
    };
    $scope.navbar = function () {
      return $scope.conf.navbar;
    };
    $scope.plugins = function () {
      return $scope.conf.plugins;
    };
    $scope.resources = function () {
      return $scope.conf.resources;
    };
    $scope.navbarBooleans = [
      'disable',
      'search',
      'navigation',
      'notifier'
    ];
    $scope.pluginConf = function (name) {
      return $scope.plugins()[name];
    };
    $scope.resourceConf = function (name) {
      return $scope.resources()[name];
    };
    $scope.isMainPlugin = function (name) {
      return $scope.pluginConf(name).main;
    };
    // Saving configuration files
    $scope.save = function () {
      var request = {
          path: $scope.filePath,
          data: $scope.conf
        };
      // This is currently hardcoded and awaits the llt-arethusa-file_server
      // running locally on port 8086.
      // Check http://github.com/latin-language-toolkit/llt-arethusa-file_server
      $http.post('http://localhost:8086/write', request).success(function (res) {
        logger.log('File saved');
        notifier.succes('File saved!');
      }).error(function (res) {
        logger.log('Error while saving file');
        notifier.error('Failed to write file!');
      });
    };
    $scope.saveAs = function (newFilename) {
    };
    // Handling Main Retrievers
    $scope.addDataSource = function (name) {
      $scope.main().retrievers[name] = createRetrieverConf();
    };
    $scope.removeDataSource = function (name) {
      delete $scope.main().retrievers[name];
    };
    function createRetrieverConf() {
      return { resource: '' };
    }
    // Handling a resource
    function createResourceConf() {
      return {
        route: '',
        params: []
      };
    }
    $scope.addResource = function (name) {
      $scope.resources()[name] = createResourceConf();
    };
    $scope.removeResource = function (name) {
      delete $scope.resources()[name];
    };
    // Handling a plugin
    $scope.addPlugin = function (name) {
      $scope.plugins()[name] = { name: name };
      $scope.main().plugins.push(name);
    };
    $scope.removePlugin = function (name) {
      var pl = $scope.main().plugins;
      pl.splice(pl.indexOf(name), 1);
      delete $scope.plugins()[name];
    };
    // Selections
    $scope.selections = {};
    $scope.toggleSelection = function (category, name) {
      if ($scope.isSelected(category, name)) {
        delete $scope.selections[category];
      } else {
        $scope.selections[category] = name;
      }
    };
    $scope.isSelected = function (category, name) {
      return $scope.selections[category] === name;
    };
    // Keeping track of the conf file - we store a copy to be able to reset it
    $scope.$watch('conf', function (newVal, oldVal) {
      $scope.confCopy = angular.copy(newVal);
    });
    $scope.reset = function () {
      $scope.conf = $scope.confCopy;
    };
    // Initialize the controller
    $scope.loadFileToEdit();
  }
]);
