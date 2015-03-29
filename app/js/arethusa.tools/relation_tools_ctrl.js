"use strict";

angular.module('arethusa.core').controller('RelationToolsCtrl', [
  '$scope',
  '$http',
  'fileHandler',
  '_',
  function(
    $scope,
    $http,
    fileHandler,
    _
  ) {
    var PATH = '/app/static/configs/relation/relations.json';

    $scope.loadLocalFile = loadLocalFile;
    $scope.saveLocalFile = saveLocalFile;


    $scope.loadWebFile = loadWebFile;

    $scope.currentFile = undefined;

    // This will fetch files directly from github at some point.
    function loadWebFile() {
      $http.get(PATH).then(function(res) {
        importList(res.data);
      });
    }

    function loadLocalFile() {
      fileHandler.upload(importList);
    }

    function importList(data, file) {
      $scope.list = new ListItem();
      // Don't forget the suffixes
      traverseList(data.relations.labels, $scope.list);
      $scope.currentFile = file ? file : undefined;
    }

    function traverseList(orig, list) {
      if (!orig) return;
      _.forEach(orig, function(el) {
        var item = new ListItem(el.short, el.long, el.style);
        list.nested.push(item);
        traverseList(el.nested, item);
      });
    }

    function saveLocalFile() {
      var data = {
        relations: {
          labels: listToJSON($scope.list.nested)
        }
      };

      fileHandler.download(
        $scope.currentFile.name,
        JSON.stringify(data, null, 2),
        'application/json'
      );
    }

    function listToJSON(list) {
        return _.inject(list, function(memo, item) {
          memo[item.short] = itemToJSON(item);
          return memo;
        }, {});
    }

    function itemToJSON(item) {
        var obj = {
          short: item.short,
          long:  item.long,
          style: item.style,
        };

        var nested = listToJSON(item.nested);
        if (_.size(nested)) {
          obj.nested = nested;
        }
        return obj;
    }

    function ListItem(abbr, full, style, nested) {
      this.short = abbr || '';
      this.long  = full || '';
      this.style = style || {};
      this.nested = nested || [];
    }

    //loadWebFile();
  }
]);
