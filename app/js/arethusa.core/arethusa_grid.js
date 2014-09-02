"use strict";

angular.module('arethusa.core').service('arethusaGrid', [
  'gridsterConfig',
  '$window',
  'plugins',
  '$rootScope',
  function(gridsterConfig, $window, plugins, $rootScope) {
    var self = this;

    var win = angular.element($window);

    this.settings = {
      dragging: true,
      resizing: true,
      pushing:  true,
      floating: true,
    };

    this.setDragging = function(val) { self.options.draggable.enabled = val; };
    this.setResizing = function(val) { self.options.resizable.enabled = val; };
    this.setPushing  = function(val) { self.options.pushing  = val; };
    this.setFloating = function(val) { self.options.floating = val; };

    this.options = angular.extend(gridsterConfig, {
      columns: 20,
      rowHeight: 'match',
      defaultSizeX: 6,
      defaultSizeY: 4,
      resizable: {
        enabled: true,
        handles: ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'],
        stop: function() { win.triggerHandler('resize'); }
      }
    });

    function Item(plugin, size, position, style) {
      size = size || [];
      position = position || [];
      return {
        sizeX: size[0],
        sizeY: size[1],
        row: position[0],
        col: position[1],
        plugin: plugin,
        style: style
      };
    }

    this.items = [
      new Item('text',     [14, 1], [0, 0]),
      new Item('depTree',  [9, 8],  [2, 0], { overflow: 'hidden'} ),
      new Item('comments', [5, 8],  [1, 9]),
      new Item('search',   [6, 2],  [0, 14]),
      new Item('morph',    [6, 4],  [2, 14]),
      new Item('relation', [6, 3],  [7, 14])
    ];

    this.init = function() {
      self.itemList = arethusaUtil.inject({}, plugins.all, function(memo, name, pl) {
        memo[name] = false;
      });

      angular.forEach(self.items, function(el, i) {
        self.itemList[el.plugin] = true;
      });
    };

    $rootScope.$on('pluginsLoaded', self.init);
  }
]);
