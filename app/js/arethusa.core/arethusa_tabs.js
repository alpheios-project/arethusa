"use strict";

angular.module('arethusa.core').directive('arethusaTabs', [
  'plugins',
  'state',
  '_',
  function(
    plugins,
    state,
    _
  ) {
    return {
      restrict: 'A',
      scope: {
        tabs: "=arethusaTabs"
      },
      link: function(scope, element, attrs) {
        var activeTabs = {};

        scope.plugins = plugins;
        scope.state = state;

        scope.$watch('tabs', function(tabs) {
          if (!tabs) return;
          activateSettings();
          doInitialActivation();
          updateVisibleTabs();
          //createDragAndDropList(tabs);
        });

        scope.moveTab = moveTab;
        scope.toggleTab = toggleTab;

        scope.isActive = isActive;

        function activate(tab) {
          activeTabs[tab.name] = true;
        }

        function deactivate(tab) {
          activeTabs[tab.name] = false;
        }

        function isActive(tab) {
          return activeTabs[tab.name];
        }

        function moveTab(i) {
          scope.tabs.splice(i, 1);
          updateVisibleTabs();
        }

        function toggleTab(tab) {
          if (isActive(tab)) {
            deactivate(tab);
          } else {
            activate(tab);
          }
          updateVisibleTabs();
        }

        function activateSettings() {
          scope.showSettingsTab = true;
        }

        function doInitialActivation() {
          _.forEach(scope.tabs, function(tab) {
            if (!angular.isDefined(isActive(tab))) {
              activate(tab);
            }
          });
        }

        function updateVisibleTabs() {
          scope.visibleTabs =_.filter(scope.tabs, function(tab) {
            return isActive(tab);
          });
        }
      },
      templateUrl: 'templates/arethusa.core/arethusa_tabs.html'
    };
  }
]);
