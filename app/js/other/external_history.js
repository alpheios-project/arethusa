"use strict";

var ExternalHistory = function() {
  var obj = {};
  obj.name = "external_history";

  return obj;
};

/* global externalPlugins */
window.externalPlugins = {};
window.externalPlugins.external_history = new ExternalHistory();
