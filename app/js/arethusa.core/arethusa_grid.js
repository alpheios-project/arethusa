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
      columns: 40,
      rowHeight: 'match',
      defaultSizeX: 6,
      defaultSizeY: 4,
      resizable: {
        enabled: self.settings.resizing,
        handles: ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'],
        stop: function() { win.triggerHandler('resize'); }
      },
      draggable: {
        enabled: self.settings.dragging,
        handle: '.drag-handle'
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
      new Item('tei',     [28, 2], [0, 0]),
      new Item('depTree',  [18, 16],  [4, 0], { overflow: 'hidden'} ),
      new Item('morph',    [10, 16],  [2, 18]),
      new Item('search',   [12, 4],  [0, 28]),
      new Item('relation', [12, 6],  [4, 28]),
      new Item('artificialToken', [12, 8],  [14, 28])
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
