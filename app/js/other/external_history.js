"use strict";

window.arethusaInitPlugin('external_history', function() {
  /* global HistoryObj */
  var obj = {
    name: 'external_history',

    api: window.arethusaExternalApi(),

    hist: new HistoryObj(2),

    container: function() {
      return $('#' + obj.name);
    },

    select: function(selector) {
      return obj.container().find(selector);
    },

    renderHistory: function() {
      var items = [];
      $.each(obj.hist.elements, function(i, item) {
        items.push('<li>' + JSON.stringify(item) + '</li>');
      });
      obj.select('#ext-hist-elements').html('<ul>' + items.join('') + '</ul>');
    },

    catchArethusaEvent: function(event) {
      obj.hist.save(event);
      obj.renderHistory();
    },
  };

  // Event handling code

  $('#undo').click(function(e) {
    obj.api.apply(obj.hist.undo());
    obj.renderHistory();
  });

  $('#redo').click(function(e) {
    obj.api.apply(obj.hist.redo());
    obj.renderHistory();
  });

  return obj;
});
