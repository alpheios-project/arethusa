"use strict";

angular.module('arethusa.contextMenu').directive('contextMenu', function($document, $parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var openMenu;
      var opened = false;
      var contextMenu = { element: null };
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

      // need this to make sure we close the menu all the time
      function handleOtherClick(event) {
        if (opened && (event.button !== 2 || event.target !== openMenu)) {
          scope.$apply(function() {
            close(contextMenu.element);
          });
        }
      }

      element.bind('contextmenu', function(event) {
        // If another menu is open while we want to open a new one,
        // we have to close the old one beforehand
        if (contextMenu.element) {
          close(contextMenu.element);
        }
        // Find the context menu in the DOM
        contextMenu.element = angular.element(document.getElementById(attrs.menuId));

        // Hold a reference to the current element for which we open
        // the context menu, so that we can detect if we right-click the
        // same element twice
        openMenu = event.target;

        // Disable the browser's default context menu
        event.preventDefault();
        event.stopPropagation();

        scope.$apply(function() {
          eventFn(scope, { $event: event });
          open(event, contextMenu.element, element);
        });
      });

      $document.bind('click', handleOtherClick);
      $document.bind('contextmenu', handleOtherClick);
      // Remember ESC hits
    }
  };

});
