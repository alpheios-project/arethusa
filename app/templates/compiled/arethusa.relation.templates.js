angular.module('arethusa.relation').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.relation/context_menu.html',
    "<div label-selector obj=\"token.relation\"></div>\n"
  );


  $templateCache.put('templates/arethusa.relation/label_selector.html',
    "<ul class=\"nested-dropdown\">\n" +
    "  <li class=\"first-item\">{{ plugin.prefixWithAncestors(obj) }}\n" +
    "    <ul\n" +
    "      ng-if=\"showMenu\"\n" +
    "      class=\"top-menu\"\n" +
    "      nested-menu-collection\n" +
    "      property=\"plugin.usePrefix\"\n" +
    "      current=\"obj\"\n" +
    "      ancestors=\"plugin.defineAncestors\"\n" +
    "      all=\"plugin.relationValues.labels\"\n" +
    "      empty-val=\"true\">\n" +
    "    </ul>\n" +
    "  </li>\n" +
    "</ul>\n" +
    "<ul class=\"nested-dropdown\">\n" +
    "  <li class=\"first-item\">{{ plugin.suffixOrPlaceholder(obj) }}\n" +
    "    <ul\n" +
    "      ng-if=\"showMenu\"\n" +
    "      class=\"top-menu\"\n" +
    "      nested-menu-collection\n" +
    "      property=\"plugin.useSuffix\"\n" +
    "      current=\"obj\"\n" +
    "      all=\"plugin.relationValues.suffixes\"\n" +
    "      empty-val=\"true\">\n" +
    "    </ul>\n" +
    "  </li>\n" +
    "</ul>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.relation/relation_multi_changer.html',
    "<div>\n" +
    "  <label class=\"note\">\n" +
    "    <span translate=\"relation.changeAll\"/>\n" +
    "  </label>\n" +
    "  <span\n" +
    "    label-selector\n" +
    "    obj=\"r.multiChanger\">\n" +
    "  </span>\n" +
    "  <button\n" +
    "    class=\"micro radius\"\n" +
    "    ng-disabled=\"! isPossible()\"\n" +
    "    ng-click=\"apply()\">\n" +
    "    <span translate=\"apply\"/>\n" +
    "  </button>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.relation/search.html',
    "<div class=\"row\">\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <label>\n" +
    "      <span translate=\"relation.searchByLabel\"/>\n" +
    "    <div\n" +
    "      label-selector\n" +
    "      obj=\"plugin.searchedLabel\"\n" +
    "      change=\"plugin.buildLabelAndSearch()\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n"
  );

}]);
