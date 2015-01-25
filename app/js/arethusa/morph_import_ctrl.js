"use strict";

angular.module('arethusa').controller('MorphImportCtrl', [
  '$scope',
  'plugins',
  'latinAttrs',
  'greekAttrs',
  'configurator',
  'MORPH_IMPORTS',
  '$http',
  '$injector',
  function($scope, plugins, latinAttrs, greekAttrs,
           configurator, MORPH_IMPORTS, $http, $injector) {
    var morph, localStorage;

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
      localStorage = $injector.get('morphLocalStorage');
      $scope.ready = true;
    });

    $scope.files = MORPH_IMPORTS;

    function loadForms(data, filter) {
      resetStatus();
      var lines = data.split('\n');
      for (var i=0; i < lines.length; i++) {
        // Fields are organized like
        // Form       - Lemma   - Postag   - User
        // Caesaris   - Caesar  - .......  - ....
        var fields = lines[i].split(',');
        var str = fields[0];
        var form = {
          lemma: fields[1],
          postag: fields[2]
          //origin: fields[3]
        };

        morph.postagToAttributes(form);
        if (formNotDuplicate(str, form)) {
          morph.addToLocalStorage(fields[0], form);
          $scope.status.count += 1;
        }
      }
    }

    function formNotDuplicate(str, form) {
      var forms;
      localStorage.retriever.getData(str, function(f) { forms = f; });
      if (forms) {
        return !aU.find(forms, function(otherForm) {
          return localStorage.comparator(form, otherForm);
        });
      }
      return true;
    }

    function resetStatus() {
      $scope.status = {
        count: 0
      };
    }

    $scope.loadFile = function(fileObj) {
      $scope.importStarted = true;
      $http.get(fileObj.route).then(function(res) {
        useLanguage(fileObj.language);
        loadForms(res.data);
        $scope.importStarted = false;
      });
    };
  }
]);
