"use strict";

angular.module('arethusa.core').factory('translator', [
  '$rootScope',
  '$translate',
  function($rootScope, $translate) {
    function translate(id, objOrFn, propertyPath) {
      $translate(id).then(function(translation) {
        if (angular.isFunction(objOrFn)) {
          objOrFn(translation);
        } else {
          arethusaUtil.setProperty(objOrFn, propertyPath, translation);
        }
      });
    }
    return function(id, objOrFn, propertyPath) {
      // needs to run when intialized
      translate(id, objOrFn, propertyPath);

      $rootScope.$on('$translateChangeSuccess', function() {
        translate(id, objOrFn, propertyPath);
      });
    };
  }
]);
