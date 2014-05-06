"use strict";

window.ArethusaExternalPlugins.add(function() {
  var obj = {};
  obj.name = "external_history";
  obj.api = function() {
    var api;
    if (api == 'undefined') {
      api = window.arethusaExternalApi();
    }
    return api;
  };

  obj.container = $('#' + obj.name);

  /* global HistoryObj */
  obj.hist = new HistoryObj(2);
  obj.catchArethusaEvent = function(event) {
    obj.hist.save(event);
  };

  return obj;
}());
