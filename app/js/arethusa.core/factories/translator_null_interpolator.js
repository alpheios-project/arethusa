'use strict';

/**
 * @ngdoc service
 * @name arethusa.core.translatorNullInterpolator
 *
 * @description
 * Additional interpolation service for angular-translate.
 * Requirement for {@link arethusa.core.translator}.
 *
 * This interpolator service does nothing and allows to disable
 * `angular-translate`'s interpolation.
 *
 * Use it by calling `$translateProvider.addInterpolator('nullInterpolator')`.
 */
angular.module('arethusa.core').factory('translatorNullInterpolator', function() {
  return {
    getInterpolationIdentifier: function() { return 'nullInterpolator'; },
    interpolate: function(string) { return string; },
    setLocale: function() {}
  };
});
