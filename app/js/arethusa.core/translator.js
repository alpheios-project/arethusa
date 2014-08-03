"use strict";

angular.module('arethusa.core').factory('translator', [
  '$rootScope',
  '$translate',
  function($rootScope, $translate) {
    function translate(id, obj, propertyPath) {
      $translate(id).then(function(translation) {
        arethusaUtil.setProperty(obj, propertyPath, translation);
      });
    }
    return function(id, obj, propertyPath) {
      // needs to run when intialized
      translate(id, obj, propertyPath);

      $rootScope.$on('$translateChangeSuccess', function() {
        translate(id, obj, propertyPath);
      });
    };
  }
]);
