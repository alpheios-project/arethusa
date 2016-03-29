angular.module('arethusa.search').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.search/search_by_string.html',
    "<div class=\"row\">\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <label>\n" +
    "      <span translate=\"search.searchByToken\"/>\n" +
    "      <div class=\"row collapse\">\n" +
    "        <div class=\"small-10 columns\">\n" +
    "          <input type=\"search\"\n" +
    "            foreign-keys\n" +
    "            ng-change=\"search.queryTokens()\"\n" +
    "            ng-model=\"search.tokenQuery\" />\n" +
    "        </div>\n" +
    "        <div class=\"small-2 columns\">\n" +
    "          <label class=\"postfix\">\n" +
    "            regex\n" +
    "            <input\n" +
    "              id=\"regex-checkbox\"\n" +
    "              type=\"checkbox\"\n" +
    "              ng-change=\"search.queryTokens()\"\n" +
    "              ng-model=\"search.queryByRegex\"/>\n" +
    "          </label>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </label>\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
