'use strict';
angular.module('arethusa.contextMenu').factory('menuElement', function () {
  return { element: null };
}).directive('contextMenu', [
  '$document',
  '$parse',
  'menuElement',
  'keyCapture',
  function ($document, $parse, menuElement, keyCapture) {
    return {
      restrict: 'A',
      scope: {
        menuObj: '=',
        menuTrigger: '@',
        menuPosition: '@',
      },
      link: function (scope, element, attrs) {
        var opened = false;
        var eventFn = $parse(attrs.contextMenu);

        function repositionContextMenu(menu, parent) {
          // reposition the context menu relative to the parent element
          var parPos = parent.offset();
          var left;
          var top;
          if (scope.menuPosition === 'bottom') {
            top = parPos.top + parent.outerHeight();
            left = parPos.left;
          }

          if (scope.menuPosition === 'right') {
            top = parPos.top;
            left = parPos.left + parent.outerWidth();
          }
          menu.css('left', left);
          menu.css('top', top);
        }

        function open(event, menu, parent) {
          menu.addClass('menu-open');
          menu.css('display', 'inline-block');

          repositionContextMenu(menu, parent);

          menuElement.lastTarget = event.target;

          // If a target object was specified, declare that we just opened
          // a contextMenu.
          if (scope.menuObj) {
            scope.menuObj.status.contextMenuOpen = true;
          }
          opened = true;
        }

        function close(menu) {
          menu.removeClass('menu-open');
          menu.css('display', 'none');

          menuElement.lastTarget = undefined;

          // If a target object was specified, declare that we just closed
          // a contextMenu.
          if (scope.menuObj) {
            scope.menuObj.status.contextMenuOpen = false;
          }
          opened = false;
        }

        function closeAndApply() {
          scope.$apply(function () {
            close(menuElement.element);
          });
        }

        function firefoxDoubleEvent(event) {
          return event.target === menuElement.lastTarget && event.button === numericClickType();
        }

        // need this to make sure we close the menu all the time
        function handleOtherClick(event) {
          // in expensive low level check first, as this gets called
          // quite a bit
          if (opened) {
            if (targetIsChildOfMenu(event.target)) return;
            if (firefoxDoubleEvent(event)) return;

            closeAndApply();
          }
        }

        function targetIsChildOfMenu(target) {
          var t = angular.element(target);
          var menu = menuElement.element;
          return t.parents('#' + menu.attr('id')).length;
        }

        function numericClickType() {
          var types = {
            rightclick: 2,
            click: 1
          };
          return types[scope.menuTrigger];
        }


        var clickType = function() {
          if (scope.menuTrigger == 'rightclick') {
            return 'contextmenu';
          }

          if (scope.menuTrigger == 'click') {
            return 'click';
          }
        }();

        element.bind(clickType, function (event) {
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
          scope.$apply(function () {
            eventFn(scope, { $event: event });
            open(event, menuElement.element, element);
          });
        });

        $document.on('click', handleOtherClick);

        var deregisterKeyBinding = keyCapture.onKeyPressed('esc', function() {
          if (opened) {
            closeAndApply();
            keyCapture.stopPropagation();
          }
        }, 1000);

        scope.$on('$destroy', function() {
          $document.off('click', handleOtherClick);
          deregisterKeyBinding();
        });
      }
    };
  }
]);
