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
  '$q',
  function($scope, plugins, latinAttrs, greekAttrs,
           configurator, MORPH_IMPORTS, $http, $injector, $q) {
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

    plugins.start(['morph']).then(function() {
      morph = plugins.get('morph');
      localStorage = $injector.get('morphLocalStorage');
      $scope.ready = true;
    });

    $scope.files = MORPH_IMPORTS;

    var userCache = {};

    var userRouteParams = {
      headers: {
        'Accept': 'application/json'
      }
    };

    function parseOrigin(form, userRoute) {
      var deferred = $q.defer();
      var userName = userCache[userRoute];
      if (userName) {
        deferred.resolve(userName);
      } else {
        $http.get(userRoute, userRouteParams).then(function(res) {
          var userName = res.data.name;
          userCache[userRoute] = userName;
          deferred.resolve(userName);
        });
      }
      return deferred.promise;
    }

    function loadForms(data, filter) {
      resetStatus();
      var lines = data.split('\n');
      angular.forEach(lines, function(line, key) {
        // Fields are organized like
        // Form       - Lemma   - Postag   - User
        // Caesaris   - Caesar  - .......  - ....
        var fields = line.split(',');
        var str = fields[0];
        var form = {
          lemma: fields[1],
          postag: fields[2]
        };

        parseOrigin(form, fields[3]).then(function(userName) {
          form.origin = userName;
          morph.postagToAttributes(form);
          if (formNotDuplicate(str, form)) {
            morph.addToLocalStorage(fields[0], form);
            $scope.status.count += 1;
          }
        });
      });
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
