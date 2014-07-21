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

      // This very weird looking line countering a spacing bug
      // in Foundation.
      // When the sidepanel is placed in a columns row together
      // with a main-body no explicit width is assigned to it at
      // first. The main-body gets a width, the sidepanel just
      // takes the rest of the available space.
      // This works fine - problems arise when the sidepanel is
      // hidden. As no explicit width has been set, Foundation
      // tries to recalculate the size of the sidepanel when it
      // gets visible again - and it does this calculation wrong.
      //
      // This workaround sets the width explicitly. panel.width()
      // returns the initial width value Foundation calculated,
      // which is absolutely correct. By setting the width to
      // exactly this value, the element writes it explicitly into
      // its style attributes. Once this is done, Foundation seems
      // not to recalculate this value again when the element
      // gets visiable again after being hidden. Exactly what we need!
      //
      // We cannot call this method on init - Angular cannot guarantee
      // its DOM load order - and indeed, on init the behaviour is
      // unstable - it might work or might not.
      // We just do it on every toggle. Is redundant most of time,
      // but it seems to fix our problem at least...
      panel.width(panel.width());
      if (self.folded) show(); else hide();
      self.folded = !self.folded;
    };

    this.activeKeys = {};

    init();
  }
]);
