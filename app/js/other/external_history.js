'use strict';
window.arethusaInitPlugin('external_history', function () {
  /* global HistoryObj */
  var obj = {
      name: 'external_history',
      arethusa: window.arethusaExternalApi(),
      hist: new HistoryObj(2),
      container: function () {
        return $('#' + obj.name);
      },
      select: function (selector) {
        return obj.container().find(selector);
      },
      renderHistory: function () {
        var items = [];
        $.each(obj.hist.elements, function (i, item) {
          items.push('<li>' + JSON.stringify(item) + '</li>');
        });
        obj.select('#ext-hist-elements').html('<ul>' + items.join('') + '</ul>');
      },
      catchArethusaEvent: function (event) {
        obj.hist.save(event);
        obj.renderHistory();
      },
      apply: function () {
        // this Law of Demeter violation needs to be delegated, however it does
        // act werid. If I try to wrap scope.$apply() in a apply() function an
        // exception is thrown (no $eval for an unknown Object).
        obj.arethusa.scope.$apply();
      },
      update: function () {
        obj.renderHistory();
        obj.apply();
      }
    };
  // Event handling code
  $('#undo').click(function (e) {
    obj.hist.undo();
    obj.update();
  });
  $('#redo').click(function (e) {
    obj.hist.redo();
    obj.update();
  });
  return obj;
});