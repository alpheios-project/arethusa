"use strict";

angular.module('arethusa.contextMenu')

.factory('menuElement', function() {
  return { element: null };
})

.directive('contextMenu', function($document, $parse, menuElement) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var opened = false;
      var eventFn = $parse(attrs.contextMenu);

      function open(event, menu, parent) {
        menu.addClass('menu-open');
        menu.removeClass('hide');

        // reposition the context menu relative to the parent element
        var parPos = parent.position();
        var top  = parPos.top + parent.outerHeight();
        var left = parPos.left;
        menu.css('left', left);
        menu.css('top', top);

        opened = true;
      }

      function close(menu) {
        menu.removeClass('menu-open');
        menu.addClass('hide');
        opened = false;
      }

      function closeAndApply() {
        scope.$apply(function() {
          close(menuElement.element);
        });
      }

      // need this to make sure we close the menu all the time
      function handleOtherClick(event) {
        if (opened && event.button !== 2) {
          closeAndApply();
        }
      }

      element.bind('contextmenu', function(event) {
        // If another menu is open while we want to open a new one,
        // we have to close the old one beforehand
        if (menuElement.element) {
          close(menuElement.element);
        }
        // Find the context menu in the DOM
        menuElement.element = angular.element(document.getElementById(attrs.menuId));

        // Disable the browser's default context menu
        event.preventDefault();
        event.stopPropagation();

        scope.$apply(function() {
          eventFn(scope, { $event: event });
          open(event, menuElement.element, element);
        });
      });

      $document.bind('click', handleOtherClick);
      $document.bind('contextmenu', handleOtherClick);
      // Close when ESC is hit
      $document.bind('keyup', function(event) {
        if (opened && event.keyCode === 27) {
          closeAndApply();
        }
      });
    }
  };

});
