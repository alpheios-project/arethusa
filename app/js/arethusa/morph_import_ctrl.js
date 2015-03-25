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
  'fileHandler',
  '_',
  function(
    $scope,
    plugins,
    latinAttrs,
    greekAttrs,
    configurator,
    MORPH_IMPORTS,
    $http,
    $injector,
    $q,
    fileHandler,
    _
  ) {
    var EXPORT_FILE_NAME   = 'arethusa_morph_forms.json';
    var EXPORT_FILE_ENDING = 'application/json';

    var ATTRS = {
      lat: latinAttrs.data,
      grc: greekAttrs.data
    };

    var USER_ROUTE_PARAMS = {
      headers: {
        'Accept': 'application/json'
      }
    };

    var morph, localStorage, userCache = {};

    var config = configurator.configuration;

    //$scope.files = MORPH_IMPORTS; // online import currently disabled
    $scope.loadCsvFile = loadCsvFile;

    $scope.importFile = importFile;
    $scope.exportFile = exportFile;

    init();

    function useLanguage(attr) {
      config.plugins.morph = ATTRS[attr];
      $scope.usedLanguage = attr;
    }

    function init() {
      // Use a starting value so the morph service can load properly
      useLanguage('lat');

      plugins.start(['morph']).then(function() {
        morph = plugins.get('morph');
        localStorage = $injector.get('morphLocalStorage');
        $scope.ready = true;
      });
    }


    function parseOrigin(form, userRoute) {
      var deferred = $q.defer();
      var userName = userCache[userRoute];
      if (userName) {
        deferred.resolve(userName);
      } else {
        $http.get(userRoute, USER_ROUTE_PARAMS).then(function(res) {
          var userName = res.data.name;
          userCache[userRoute] = userName;
          deferred.resolve(userName);
        });
      }
      return deferred.promise;
    }

    function loadFormsFromCsv(data, filter) {
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
        import: { count: 0 },
        export: { count: 0 }
      };
    }

    function loadCsvFile(fileObj) {
      $scope.importStarted = true;
      $http.get(fileObj.route).then(function(res) {
        useLanguage(fileObj.language);
        loadFormsFromCsv(res.data);
        $scope.importStarted = false;
      });
    }

    function loadFile(file) {

    }

    function importFile() {
      resetStatus();
      fileHandler.upload(function(data) {
        _.forEach(data, function(forms, str) {
          localStorage.addForms(str, forms);
        });
        setImportCount(data);
        $scope.$digest(); // so that the count can update
      });
    }

    function exportFile() {
      resetStatus();

      var forms = localStorage.getForms();
      fileHandler.download(
        EXPORT_FILE_NAME,
        JSON.stringify(forms, null, 2),
        EXPORT_FILE_ENDING
      );

      setExportCount(forms);
    }

    function setExportCount(forms) {
      setCount('export', forms);
    }

    function setImportCount(forms) {
      setCount('import', forms);
    }

    function setCount(type, forms) {
      $scope.status[type].count = countForms(forms);
    }

    function countForms(forms) {
      return _.inject(forms, function(memo, f) {
        memo += f.length;
        return memo;
      }, 0);
    }
  }
]);
