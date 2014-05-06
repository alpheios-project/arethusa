"use strict";

// Defines a global object where external plugins can register themselves.
// Very raw and sketchy, we'll see how this evolves.
window.ArethusaExternalPlugins = {};
window.ArethusaExternalPlugins.add = function(name, pluginFn) {
  this[name] = pluginFn;
};
