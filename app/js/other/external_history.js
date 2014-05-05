"use strict";

var ExternalHistory = function() {
  var obj = {};
  obj.name = "external_history";

  return obj;
};

window.ArethusaExternalPlugins.add(new ExternalHistory());
