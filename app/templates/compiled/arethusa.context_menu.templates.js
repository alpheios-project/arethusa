angular.module('arethusa.contextMenu').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.context_menu/arethusa_context_menu.html',
    "<div id=\"tcm{{ token.id }}\" class=\"token-context-menu\">\n" +
    "  <div ng-if=\"token.status.contextMenuOpen\">\n" +
    "    <div ng-repeat=\"plugin in plugins\">\n" +
    "      <plugin-context-menu class=\"menu-element\"></plugin-context-menu>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
