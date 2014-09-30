"use strict";

angular.module('arethusa.core').factory('translator', [
  '$rootScope',
  '$translate',
  function($rootScope, $translate) {
    function formatTrslObj(translation, id) {
      var obj = {};
      obj.start = translation[id + '.start'];
      obj.end = translation[id + '.end'];
      return obj;
    }

    function translate(id, objOrFn, propertyPath, startAndEnd) {
      var trslId = startAndEnd ? [id + '.start', id + '.end'] : id;
      $translate(trslId).then(function(translation) {
        if (startAndEnd) {
          translation = formatTrslObj(translation, id);
        }

        if (angular.isFunction(objOrFn)) {
          objOrFn(translation);
        } else {
          arethusaUtil.setProperty(objOrFn, propertyPath, translation);
        }
      });
    }
    return function(id, objOrFn, propertyPath, startAndEnd) {
      // needs to run when intialized
      translate(id, objOrFn, propertyPath, startAndEnd);

      $rootScope.$on('$translateChangeSuccess', function() {
        translate(id, objOrFn, propertyPath, startAndEnd);
      });
    };
  }
]);
