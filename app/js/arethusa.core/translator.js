"use strict";

angular.module('arethusa.core').factory('translator', [
  '$rootScope',
  '$translate',
  '$interpolate',
  function($rootScope, $translate, $interpolate) {
    function translate(id, objOrFn, propertyPath) {
      $translate(id, null, 'nullInterpolator').then(function(translation) {
        if (angular.isFunction(objOrFn)) {
          objOrFn(translation);
        } else {
          arethusaUtil.setProperty(
            objOrFn,
            propertyPath,
            $interpolate(translation)
          );
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
