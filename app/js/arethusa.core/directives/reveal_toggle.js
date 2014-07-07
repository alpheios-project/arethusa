"use strict";

angular.module('arethusa.core').directive('revealToggle', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var tId = attrs.revealToggle;
      var alwaysReveal = attrs.alwaysReveal;
      var slide = attrs.slide;


      function el() {
        return angular.element(document.getElementById(tId));
      }

      element.bind('click', function() {
        var t = el();
        if (alwaysReveal || t.hasClass('hide')) {
          if (slide) t.slideDown();
          t.removeClass('hide');
          t.trigger('show-' + tId);
        } else {
          if (slide) t.slideUp();
          t.addClass('hide');
          t.trigger('hide-' + tId);
        }
      });
    }
  };
});
