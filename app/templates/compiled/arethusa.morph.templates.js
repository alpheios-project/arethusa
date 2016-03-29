angular.module('arethusa.morph').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.morph/context_menu.html',
    "<div>{{ plugin.concatenatedAttributes(token.morphology) }}</div>\n"
  );


  $templateCache.put('templates/arethusa.morph/morph_form_attributes.html',
    "<div class=\"small-12 columns note\">\n" +
    "  <alert\n" +
    "    class=\"error radius center fade-in\"\n" +
    "    ng-if=\"confirmationRequested\">\n" +
    "    Do you really want to remove this form?\n" +
    "    <div class=\"small-1 columns\">\n" +
    "      <i ng-click=\"removeForm()\" class=\"clickable fi-check\"></i>\n" +
    "    </div>\n" +
    "    <div class=\"small-1 columns\">\n" +
    "      <i ng-click=\"skipRemoval()\" class=\"clickable fi-x\"></i>\n" +
    "    </div>\n" +
    "  </alert>\n" +
    "\n" +
    "  <div class=\"right\">\n" +
    "    <a\n" +
    "      mirror-morph-form=\"form\"\n" +
    "      reveal-toggle=\"mfc{{ tokenId }}\"\n" +
    "      always-reveal=\"true\"\n" +
    "      token-id=\"tokenId\">\n" +
    "      Create new\n" +
    "    </a>\n" +
    "    <span>&nbsp;-&nbsp;</span>\n" +
    "    <a\n" +
    "      target=\"_blank\"\n" +
    "      href=\"http://http://www.perseus.tufts.edu/\">\n" +
    "      Report Error\n" +
    "    </a>\n" +
    "    <span>&nbsp;-&nbsp;</span>\n" +
    "    <a\n" +
    "      ng-click=\"askForRemoval()\">\n" +
    "      Remove Form\n" +
    "    </a>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div class=\"small-12 columns text\" ng-repeat=\"o in attrs\">\n" +
    "  <span class=\"small-5 columns note\">\n" +
    "    <span class=\"right\">{{ m.longAttributeName(o.attr) }}</span>\n" +
    "  </span>\n" +
    "  <span class=\"small-7 columns\"> {{ m.longAttributeValue(o.attr, o.val) }}</span>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div ng-if=\"inv\" class=\"small-12 columns\">\n" +
    "  <hr>\n" +
    "  <div>\n" +
    "    <p>\n" +
    "      <span class=\"small-8 columns\"><em>Lexical Inventory</em></span>\n" +
    "      <span class=\"small-4 columns note\">\n" +
    "        <a href=\"{{ inv.uri }}\" target=\"_blank\">{{ inv.urn }}</a>\n" +
    "      </span>\n" +
    "    </p>\n" +
    "  </div>\n" +
    "  <br>\n" +
    "  <div class=\"small-12 columns\" style=\"margin-top: 1em\">\n" +
    "    <ul class=\"text\">\n" +
    "      <li>Dictionary Entries\n" +
    "        <ul class=\"text\">\n" +
    "          <li ng-repeat=\"(name, link) in inv.dictionaries\">\n" +
    "            <a href=\"{{ link }}\" target=\"_blank\">{{ name }}</a>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.morph/search.html',
    "<div class=\"row\">\n" +
    "<div class=\"small-12 columns\">\n" +
    "  <label>\n" +
    "    <span translate=\"morph.searchByForm\"/>\n" +
    "    <div class=\"row collapse\">\n" +
    "    <div class=\"small-10 columns\">\n" +
    "      <input type=\"search\"\n" +
    "        ng-change=\"plugin.queryForm()\"\n" +
    "        ng-model=\"plugin.formQuery\" />\n" +
    "    </div>\n" +
    "    <div class=\"small-2 columns\">\n" +
    "    <label class=\"postfix\">\n" +
    "      <span translate=\"morph.matchAll\"/>\n" +
    "      <input\n" +
    "        type=\"checkbox\"\n" +
    "        ng-change=\"plugin.queryForm()\"\n" +
    "        ng-model=\"plugin.matchAll\"/>\n" +
    "    </label>\n" +
    "    </div>\n" +
    "    </div>\n" +
    "  </label>\n" +
    "</div>\n" +
    "</div>\n" +
    "\n"
  );

}]);
