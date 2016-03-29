angular.module('arethusa.depTree').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.dep_tree/context_menu.html',
    "<div class=\"button-group\">\n" +
    "  <span class=\"button micro radius\" ng-click=\"plugin.disconnect(token)\">disconnect</span>\n" +
    "  <span class=\"button micro radius\" ng-click=\"plugin.toRoot(token)\">to root</span>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.dep_tree/dep_tree_navigator.html',
    "<div class=\"left tree-focus-trigger-controls\" to-bottom>\n" +
    "  <div\n" +
    "    ng-repeat=\"trigger in focusTriggers\"\n" +
    "    class=\"tree-focus-trigger clickable\"\n" +
    "    ng-class=\"{ 'tree-focus-sel': trigger === currentFocus }\"\n" +
    "    ng-click=\"setCurrentFocus(trigger)\">\n" +
    "  </div>\n" +
    "<div/>\n"
  );


  $templateCache.put('templates/arethusa.dep_tree/settings.html',
    "<span\n" +
    "  title=\"{{ translations.compact() }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"compactTree()\">\n" +
    "  <i class=\"fa fa-compress\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.widen() }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"wideTree()\">\n" +
    "  <i class=\"fa fa-expand\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.changeDir() }} {{ keyHints.directionChange }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"changeDir()\">\n" +
    "  <i class=\"fi-loop rotate-on-hover\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.focusRoot() }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"focusRoot()\">\n" +
    "  <i class=\"fa fa-crosshairs rotate-on-hover\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.focusSel() }} {{ keyHints.focusSelection}}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"focusSelection()\">\n" +
    "  <i class=\"fi-target-two rotate-on-hover\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.centerTree() }} {{ keyHints.centerTree }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"centerGraph()\">\n" +
    "  <i class=\"fa fa-dot-circle-o\"></i>\n" +
    "</span>\n" +
    "<span\n" +
    "  title=\"{{ translations.perfectWidth() }} {{ keyHints.perfectWidth }}\"\n" +
    "  class=\"settings-span-button\"\n" +
    "  ng-click=\"perfectWidth()\">\n" +
    "  <i class=\"fa fa-arrows-h\"></i>\n" +
    "</span>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.dep_tree/tree_setting.html',
    "<span>\n" +
    "  <span class=\"note\">{{ title }}</span>\n" +
    "  <input style=\"display: inline; height: 1.2rem; width: 3rem\" type=\"text\" ng-model=\"val\"/> \n" +
    "  <span ng-click=\"increment()\">+</span>\n" +
    "  <span ng-click=\"decrement()\">-</span>\n" +
    "</span>\n"
  );

}]);
