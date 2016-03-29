angular.module('arethusa.constituents').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.constituents/constituents.html',
    "<div class=\"tree-canvas\">\n" +
    "  <div class=\"tree-settings\">\n" +
    "    <span\n" +
    "      class=\"note right settings-span-button\"\n" +
    "      style=\"margin-left: 10px\"\n" +
    "      unused-token-highlighter\n" +
    "      uth-check-property=\"constituency.parent\">\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div\n" +
    "    lang-specific\n" +
    "    constituency-tree\n" +
    "    tokens=\"state.tokens\"\n" +
    "    styles=\"plugin.diffStyles()\"\n" +
    "    to-bottom>\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
