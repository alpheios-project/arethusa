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

    function init() {
      if (self.folded) {
        main.width(main.width() + panel.width());
        panel.hide();
      }
    }

    this.toggle = function() {
      var width = panel.width();
      var mainWidth = main.width();
      if (self.folded) {
        main.width(mainWidth - width);
        panel.show();
      } else {
        main.width(mainWidth + width);
        panel.hide();
      }
      self.folded = !self.folded;
    };

    init();
  }
]);
