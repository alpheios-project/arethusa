"use strict";

/**
 * @ngdoc function
 * @name arethusa.core.translator
 *
 * @description
 * Flexible Wrapper around `angular-translate`'s `$translate` service.
 *
 * Requires {@link arethusa.core.translatorNullInterpolator nullInterpolator}
 *  to be active.
 *
 * @param {String|Array|Object} id The prime job ob this argument is to define
 *   the `translationId(s)` used with the `$translate` service. The argument
 *   can either be
 *
 *   - a String to define a single id. When a string is given, the third
 *     argument to this function is mandatory.
 *   - an Array to define multiple ids at once. The ids are not only used
 *     for lookup, but also as identifier to store the result in the Object
 *     of the second argument to this function
 *   - an Object used as map of `translationIds` and identifiers used to store
 *     the results. The keys serve as lookup ids, while the values are used
 *     as keys in the resulting object of this function.
 * @param {Object|Function} [objOrFn={}] When this argument is an object or not
 *   given at all - in which case an empty object will be used as default - it
 *   will be the data container to store the results of the translation process
 *   to.
 *
 *   When this argument is a Function, the
 *   first argument should be a string, although other combinations are not
 *   explicitly prohibited.
 * @param {String} [propertyPath] Only effective when the first argument
 *   is a string. Generally deprecated - better use the Object or Array options
 *   to define this path.
 *
 * @returns {Object or Function} Returns the second argument of the function,
 *   which is either the given `Object`, the given `Function` or the newly
 *   generated `Object`, when no second argument was given.
 *
 *   The object is a dictionary where its keys are defined through the
 *   `propertyPath` (either directly through the third argument or indirectly
 *   through the first argument). Its values are {@link $interpolate} functions
 *   that take a an optional context object. The string returned by this
 *   function will be properly localized.
 *
 * @requires $rootScope
 * @requires $translate
 * @requires $interpolate
 */
angular.module('arethusa.core').factory('translator', [
  '$rootScope',
  '$translate',
  '$interpolate',
  function($rootScope, $translate, $interpolate) {
    function translate(id, objOrFn, propertyPath) {
      $translate(id, null, 'nullInterpolator').then(function(translation) {
        var interpolate = $interpolate(translation);
        if (angular.isFunction(objOrFn)) {
          objOrFn(interpolate);
        } else {
          arethusaUtil.setProperty(objOrFn, propertyPath, interpolate);
        }
      });
    }

    function registerAndTranslate(id, objOrFn, propertyPath) {
      // needs to run when intialized
      translate(id, objOrFn, propertyPath);

      $rootScope.$on('$translateChangeSuccess', function() {
        translate(id, objOrFn, propertyPath);
      });
    }
    return function(idOrObj, objOrFn, propertyPath) {
      objOrFn = objOrFn || {};
      if (angular.isObject(idOrObj)) {
        if (angular.isArray(idOrObj)) {
          angular.forEach(idOrObj, function(idAndPath) {
            registerAndTranslate(idAndPath, objOrFn, idAndPath);
          });
        } else {
          angular.forEach(idOrObj, function(path, id) {
            registerAndTranslate(id, objOrFn, path);
          });
        }
      } else {
        registerAndTranslate(idOrObj, objOrFn, propertyPath);
      }

      return objOrFn;
    };
  }
]);
