"use strict";

angular.module('arethusa.core').service('arethusaGrid', [
  'gridsterConfig',
  '$window',
  function(gridsterConfig, $window) {
    var self = this;

    var win = angular.element($window);

    this.options = angular.extend(gridsterConfig, {
      columns: 20,
      rowHeight: 'match',
      resizable: {
        enabled: true,
        stop: function() { win.trigger('resize'); }
      }
    });

    function Item(size, position, plugin) {
      return {
        sizeX: size[0],
        sizeY: size[1],
        row: position[0],
        col: position[1],
        plugin: plugin,
      };
    }

    this.items = [
      new Item([14, 1], [0, 0], 'text'),
      new Item([9, 8],  [2, 0], 'depTree'),
      new Item([5, 8],  [1, 9], 'comments'),
      new Item([6, 2],  [0, 14], 'search'),
      new Item([6, 4],  [2, 14], 'morph'),
      new Item([6, 3],  [6, 14], 'relation')
    ];
  }
]);
