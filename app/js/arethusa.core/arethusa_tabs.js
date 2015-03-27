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
        var tabMap;
        var tabConf = getFromLocalStorage();

        scope.plugins = plugins;
        scope.state = state;

        scope.moveTab = moveTab;
        scope.toggleTab = toggleTab;

        scope.isActive = isActive;

        scope.$watch('tabs', init);

        function init(tabs) {
          if (!tabs) return;
          // Dragging and dropping can be a bit buggy when working on our large
          // object. We therefore only work on a small dataset and update the real
          // tabs once it changes.
          scope.list = createListItems(tabs);
          tabMap = createTabMap(tabs);
          activateSettings();
          doInitialActivation(tabs);
          updateVisibleTabs();
        }

        function createListItems(tabs) {
          return _.map(tabs, createListItem);
        }

        function createListItem(tab) {
          return {
            name: tab.name,
            label: tab.displayName
          };
        }

        function createTabMap(tabs) {
          return _.inject(tabs, function(memo, tab) {
            memo[tab.name] = tab;
            return memo;
          }, {});
        }

        function activate(tab) {
          getConf(tab).active = true;
        }

        function deactivate(tab) {
          getConf(tab).active = false;
        }

        function isActive(tab) {
          return getConf(tab).active;
        }

        function getConf(tab) {
          var conf = tabConf[tab.name];
          if (!conf) conf = tabConf[tab.name] = {};
          return conf;
        }

        function moveTab(i, event) {
          // The splice happens a little delayed, which means that for a short
          // while we'll have one item in the list twice - let's hide it to
          // avoid the flicker.
          angular.element(event.toElement).hide();
          scope.list.splice(i, 1);
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

        function doInitialActivation(tabs) {
          _.forEach(tabs, function(tab) {
            // If a setting is already present, don't do anything,
            // otherwise activate it.
            if (!angular.isDefined(isActive(tab))) {
              activate(tab);
            }
          });
        }

        function updateVisibleTabs() {
          scope.visibleTabs =_.inject(scope.list, function(memo, item) {
            if (isActive(item)) {
              memo.push(tabMap[item.name]);
            }
            return memo;
          }, []);
        }

        function getFromLocalStorage() {
          return arethusaLocalStorage.get(LOCAL_STORAGE_KEY) || {};
        }

        function setLocalStorage() {
          arethusaLocalStorage.set(LOCAL_STORAGE_KEY, tabConf);
        }
      },
      templateUrl: 'templates/arethusa.core/arethusa_tabs.html'
    };
  }
]);
