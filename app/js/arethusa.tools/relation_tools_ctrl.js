"use strict";

angular.module('arethusa.core').controller('RelationToolsCtrl', [
  '$scope',
  '$http',
  '_',
  function(
    $scope,
    $http,
    _
  ) {
    var PATH = '/app/static/configs/relation/relations.json';
    $scope.loadFile = loadFile;

    function init() {

    }

    // This will fetch files directly from github at some point.
    function loadFile() {
      $http.get(PATH).then(function(res) {
        importList(res.data);
      });
    }

    function importList(data) {
      $scope.list = new ListItem();
      // Don't forget the suffixes
      traverseList(data.relations.labels, $scope.list);
    }

    function traverseList(orig, list) {
      if (!orig) return;
      _.forEach(orig, function(el) {
        var item = new ListItem(el.short, el.long);
        list.add(item);
        traverseList(el.nested, item);
      });
    }

    function ListItem(abbr, full, list) {
      var self = this;
      this.short = abbr;
      this.long  = full;
      this.list = list || [];

      this.add = add;

      function add(el) {
        self.list.push(el);
      }
    }

    loadFile();
  }
]);
