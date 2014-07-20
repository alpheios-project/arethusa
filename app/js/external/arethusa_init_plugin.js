// DEPRECATED in this form - we have a much nicer API through state events
// now - we'll update this later, when we need it.
//
// Is NOT functional atm.

'use strict';
window.arethusaInitPlugin = function (name, fn) {
  var templateCode = fn();
  var plugin = window.arethusaExternalApi().scope.plugins[name];
  angular.forEach(templateCode, function (value, key) {
    plugin[key] = value;
  });
};
