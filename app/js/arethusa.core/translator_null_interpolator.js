'use strict';

angular.module('arethusa.core').factory('translatorNullInterpolator', function() {
  return {
    getInterpolationIdentifier: function() { return 'nullInterpolator'; },
    interpolate: function(string) { return string; },
    setLocale: function() {}
  };
});
