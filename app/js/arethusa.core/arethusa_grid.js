"use strict";

angular.module('arethusa.core').service('arethusaGrid', [
  'gridsterConfig',
  function(gridsterConfig) {
    var self = this;

    this.options = angular.extend(gridsterConfig, {
      columns: 20,
      rowHeight: 'match'
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

    console.log(this.options);
    this.items = [
      new Item([8, 1], [0, 0], 'text'),
      new Item([8, 7], [1, 0], 'depTree'),
      new Item([4, 1], [0, 8], 'search'),
      new Item([4, 4], [1, 8], 'morph'),
      new Item([4, 2], [4, 8], 'relation')
    ];
  }
]);
