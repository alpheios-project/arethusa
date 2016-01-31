"use strict";

angular.module('arethusa.core').value('duScrollEasing', function(t) {
  // cubic in and out
  return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
});
