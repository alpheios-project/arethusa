"use strict";

window.ArethusaExternalPlugins.add('external_history', function() {
  var obj = {};
  obj.name = "external_history";
  obj.api = window.arethusaExternalApi();
  /* global HistoryObj */
  obj.hist = new HistoryObj(2);
  obj.history = obj.hist.elements;
  obj.containerId = '#' + obj.name;
  obj.container = function() {
    return $(obj.containerId);
  };
  obj.select = function(selector) {
    return obj.container().find(selector);
  };

  obj.renderHistory = function() {
    var items = [];
    $.each(obj.history, function(i, item) {
      items.push('<li>' + JSON.stringify(item) + '</li>');
    });
    obj.select('#ext-hist-elements').html('<ul>' + items.join('') + '</ul>');
  };

  obj.catchArethusaEvent = function(event) {
    obj.hist.save(event);
    obj.renderHistory();
  };

  return obj;
});
