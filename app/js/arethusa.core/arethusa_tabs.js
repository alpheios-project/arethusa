"use strict";

angular.module('arethusa.core').directive('arethusaTabs', [
  'plugins',
  'state',
  'arethusaLocalStorage',
  '_',
  function(
    plugins,
    state,
    arethusaLocalStorage,
    _
  ) {
    var LOCAL_STORAGE_KEY = 'tabsConfiguration';

    return {
      restrict: 'A',
      scope: {
        tabs: "=arethusaTabs"
      },
      link: function(scope, element, attrs) {
        var activeTabs = getFromLocalStorage();

        scope.plugins = plugins;
        scope.state = state;

        scope.moveTab = moveTab;
        scope.toggleTab = toggleTab;

        scope.isActive = isActive;

        scope.$watch('tabs', init);

        function init(tabs) {
          if (!tabs) return;

          activateSettings();
          doInitialActivation();
          updateVisibleTabs();
        }


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
          setLocalStorage();
        }

        function activateSettings() {
          scope.showSettingsTab = true;
        }

        function doInitialActivation() {
          _.forEach(scope.tabs, function(tab) {
            // If a setting is already present, don't do anything,
            // otherwise activate it.
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

        function getFromLocalStorage() {
          return arethusaLocalStorage.get(LOCAL_STORAGE_KEY) || {};
        }

        function setLocalStorage() {
          arethusaLocalStorage.set(LOCAL_STORAGE_KEY, activeTabs);
        }
      },
      templateUrl: 'templates/arethusa.core/arethusa_tabs.html'
    };
  }
]);
