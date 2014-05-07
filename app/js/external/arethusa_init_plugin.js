"use strict";

window.arethusaInitPlugin = function(name, fn) {
  var templateCode = fn();
  var plugin = window.arethusaExternalApi().scope.plugins[name];
  angular.forEach(templateCode, function(value, key) {
    plugin[key] = value;
  });
};
