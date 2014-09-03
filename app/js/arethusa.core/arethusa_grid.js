"use strict";

angular.module('arethusa.core').service('arethusaGrid', [
  'gridsterConfig',
  '$window',
  'plugins',
  '$rootScope',
  'notifier',
  function(gridsterConfig, $window, plugins, $rootScope, notifier) {
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
      new Item('morph',    [5, 8],  [1, 9]),
      new Item('search',   [6, 2],  [0, 14]),
      new Item('relation', [6, 4],  [2, 14]),
      new Item('artificialToken', [6, 4],  [7, 14])
    ];

    this.addItem = function(name) {
      self.items.push(new Item(name));
      notifier.success(name + ' added to the grid!');
    };

    function findItem(name) {
      var res;
      for (var i = self.items.length - 1; i >= 0; i--){
        var el = self.items[i];
        if (el.plugin === name) {
          res = el;
          break;
        }
      }
      return res;
    }

    this.removeItem = function(name) {
      var i = self.items.indexOf(findItem(name));
      self.items.splice(i, 1);
      notifier.info(name + ' removed from grid!');
    };

    this.toggleItem = function(name) {
      // Mind that these function is inverted due to its
      // usage in an input checkbox.
      // We already can read the updated value here and
      // therefore need to invert our action.
      if (self.itemList[name]) {
        self.addItem(name);
      } else {
        self.removeItem(name);
        //self.itemList[name] ;
      }
    };

    this.init = function() {
      self.itemList = arethusaUtil.inject({}, plugins.all, function(memo, name, pl) {
        memo[name] = false;
      });

      angular.forEach(self.items, function(el, i) {
        self.itemList[el.plugin] = true;
      });
    };

    // Scenario 1: When the application starts
    $rootScope.$on('pluginsLoaded', self.init);
    // Scenario 2: When a layout is changed on the fly
    if (plugins.loaded) self.init();
  }
]);
