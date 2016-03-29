angular.module('arethusa.artificialToken').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.artificial_token/artificial_token.html',
    "<div class=\"small-12 columns text-center\">\n" +
    "  <span\n" +
    "    class=\"button tiny radius\"\n" +
    "    ng-click=\"plugin.toggleMode('create')\">\n" +
    "    <span translate=\"create\"/>\n" +
    "  </span>\n" +
    "  <span\n" +
    "    class=\"button tiny radius\"\n" +
    "    ng-click=\"plugin.toggleMode('list')\">\n" +
    "    <span translate=\"list\"/>\n" +
    "  </span>\n" +
    "  <div delimiter/>\n" +
    "  <div ng-if=\"plugin.mode === 'create'\">\n" +
    "    <form name=\"cAT\">\n" +
    "      <label>\n" +
    "        <span translate=\"aT.visualRepresentation\"/>\n" +
    "        <input\n" +
    "          type=\"text\"\n" +
    "          foreign-keys\n" +
    "          ng-model=\"plugin.model.string\"/>\n" +
    "      </label>\n" +
    "      <div class=\"text-left\">\n" +
    "        <select\n" +
    "          class=\"compact\"\n" +
    "          required\n" +
    "          ng-model=\"plugin.model.type\"\n" +
    "          ng-options=\"type for type in plugin.supportedTypes\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "      <span artificial-token-insertion-pointer/>\n" +
    "      <div delimiter/>\n" +
    "    </form>\n" +
    "    <button\n" +
    "      class=\"tiny radius\"\n" +
    "      ng-disabled=\"!plugin.modelValid()\"\n" +
    "      ng-click=\"plugin.propagateToState()\">\n" +
    "      <span translate=\"aT.addToken\"/>\n" +
    "    </button>\n" +
    "  </div>\n" +
    "  <div\n" +
    "    ng-if=\"plugin.mode === 'list'\"\n" +
    "    artificial-token-list>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.artificial_token/artificial_token_default_ip.html',
    "<label style=\"margin-right: 15px\">\n" +
    "  Activate default insertion point\n" +
    "  <input\n" +
    "    type=\"checkbox\"\n" +
    "    style=\"margin: 0\"\n" +
    "    ng-model=\"aT.defaultInsertionPoint\"\n" +
    "    ng-change=\"aT.addDefaultInsertionPoint()\"/>\n" +
    "</label>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.artificial_token/artificial_token_edit.html',
    "<input foreign-keys type=\"text\" ng-change=\"changeString()\" ng-model=\"string\"/>\n" +
    "<select\n" +
    "  class=\"compact\"\n" +
    "  required\n" +
    "  ng-model=\"type\"\n" +
    "  ng-change=\"changeType()\"\n" +
    "  ng-options=\"opt for opt in aT.supportedTypes\">\n" +
    "</select>\n"
  );


  $templateCache.put('templates/arethusa.artificial_token/artificial_token_insertion_pointer.html',
    "<div class=\"small-12 columns\">\n" +
    "  <label>\n" +
    "    <span translate=\"aT.insertionPoint\"/>\n" +
    "    <div class=\"small-panel row text-left\">\n" +
    "      <span ng-if=\"!insertionPoint\">-</span>\n" +
    "      <span ng-if=\" insertionPoint\">\n" +
    "        <span>{{ insertDirText }}</span>\n" +
    "        <span\n" +
    "          token-with-id\n" +
    "          value=\"insertionPoint.string\"\n" +
    "          token-id=\"insertionPoint.id\">\n" +
    "        </span>\n" +
    "      </span>\n" +
    "      <span class=\"right\">\n" +
    "        <span\n" +
    "          ng-click=\"enterSelectMode()\"\n" +
    "          class=\"button micro radius\">\n" +
    "          <i class=\"fa fa-crosshairs rotate-on-hover\"></i>\n" +
    "        </span>\n" +
    "        <span class=\"button micro radius\"\n" +
    "          ng-click=\"toggleDir()\"\n" +
    "          title=\"{{ insertDirHint }}\">\n" +
    "          <i class=\"fa fa-arrow-{{ arrow }}\"></i>\n" +
    "        </span>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "  </label>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.artificial_token/artificial_token_list.html',
    "<p\n" +
    "  ng-if=\"aT.count === 0\"\n" +
    "  class=\"text\"\n" +
    "  style=\"margin-left: 0.75rem\">\n" +
    "  <span translate=\"aT.noArtTokensPresent\"/>\n" +
    "</p>\n" +
    "\n" +
    "<div class=\"panel\" ng-repeat=\"(id, token) in aT.createdTokens\">\n" +
    "  <div>\n" +
    "    <span class=\"left\">\n" +
    "      <span\n" +
    "        class=\"normal-size\"\n" +
    "        token=\"token\"\n" +
    "        colorize=\"true\"\n" +
    "        click=\"true\"\n" +
    "        hover=\"true\">\n" +
    "      </span>\n" +
    "      <sup\n" +
    "        class=\"note\">\n" +
    "        {{ formatId(id) }}\n" +
    "      </sup>\n" +
    "    </span>\n" +
    "    <span class=\"right\">\n" +
    "      <span\n" +
    "        ng-click=\"aT.removeToken(id)\"\n" +
    "        class=\"button tiny radius\">\n" +
    "        <span translate=\"delete\"/>\n" +
    "      </span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div artificial-token-edit=\"token\"/>\n" +
    "</div>\n"
  );

}]);
