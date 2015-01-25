"use strict";

angular.module('arethusa').controller('MorphImportCtrl', [
  '$scope', 'plugins',
  'latinAttrs',
  'greekAttrs',
  'configurator',
  '$http', function($scope, plugins, latinAttrs, greekAttrs, configurator, $http) {
    var morph;
    var attrs = {
      lat: latinAttrs.data,
      grc: greekAttrs.data
    };

    var config = configurator.configuration;

    function useLanguage(attr) {
      config.plugins.morph = attrs[attr];
      $scope.usedLanguage = attr;
    }

    // Use a starting value so the morph service can load properly
    useLanguage('lat');

    var data = "Caesar,Caesar,n-s---mn-,lfdm";

    plugins.start(['morph']).then(function() {
      morph = plugins.get('morph');
      $scope.ready = true;
    });

    $scope.files = [
      {
        name: 'Latin Morphology',
        language: 'lat',
        route: '...'
      },
      {
        name: 'Greek Morphology',
        language: 'grc',
        route: '...'
      }
    ];

    function loadForms(data, filter) {
      var lines = data.split('\n');
      for (var i=0; i < lines.length; i++) {
        // Fields are organized like
        // Form       - Lemma   - Postag   - User
        // Caesaris   - Caesar  - .......  - ....
        var fields = lines[i].split(',');
        var form = {
          lemma: fields[1],
          postag: fields[2],
          origin: fields[3]
        };

        morph.postagToAttributes(form);
        morph.addToLocalStorage(fields[0], form);
      }
    }

    $scope.loadFile = function(fileObj) {
      $http.get(fileObj.route).then(function(res) {
        useLanguage(fileObj.language);
        loadForms(res.data);
      });

    };
  }
]);
