"use strict";

angular.module('arethusa.core').service('sidepanel', [
  'configurator',
  function(configurator) {
    var self = this;

    this.folded = configurator.configurationFor('main').foldSidepanel;

    function get(id) {
      return angular.element(document.getElementById(id));
    }

    var main = get('main-body');
    var panel = get('sidepanel');

    function show() {
      main.width(main.width() - panel.width());
      panel.show();
    }

    function hide() {
      main.width(main.width() + panel.width());
      panel.hide();
    }

    function init() {
      if (self.folded) hide();
    }

    this.toggle = function() {
      if (self.folded) show(); else hide();
      self.folded = !self.folded;
    };

    init();
  }
]);
