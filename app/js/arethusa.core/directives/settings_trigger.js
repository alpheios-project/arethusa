"use strict";

angular.module('arethusa.core').directive('settingsTrigger', [
  'translator',
  function(translator) {
    return {
      restrict: 'A',
      replace: true,
      link: function(scope, element, attrs) {
        var dir = attrs.settingsTrigger || 'left';
        var margin = 'margin-' + (dir === 'left' ? 'right' : 'left');
        var r = dir === 'left' ? '' : 'bw-';

        element.addClass(dir);
        element.addClass('rotate-' + r + 'on-hover');
        element.css(margin, '10px');

        translator('settings', function(translation) {
          element.attr('title', translation());
        });
      },
      templateUrl: 'templates/arethusa.core/settings_trigger.html'
    };
  }
]);
