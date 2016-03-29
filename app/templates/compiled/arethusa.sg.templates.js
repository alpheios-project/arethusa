angular.module('arethusa.sg').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.sg/ancestors.html',
    "<div class=\"text\">\n" +
    "  <div\n" +
    "    ng-repeat=\"o in hierarchy\"\n" +
    "    ng-class=\"{underline: hover, italic: requested(o)}\"\n" +
    "    ng-mouseenter=\"hover = o.sections\"\n" +
    "    ng-mouseleave=\"hover = false\"\n" +
    "    ng-click=\"requestGrammar(o)\"\n" +
    "    style=\"padding: 2px 0\"\n" +
    "    ng-style=\"{'margin-left': 0.75 * $index + 'em'}\">\n" +
    "    ‣ {{ o.long }}\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.sg/context_menu.html',
    "<div sg-context-menu-selector obj=\"token.sg\"></div>\n"
  );


  $templateCache.put('templates/arethusa.sg/sg_context_menu_selector.html',
    "<ul class=\"nested-dropdown\">\n" +
    "  <li class=\"first-item\">{{ heading }}\n" +
    "    <ul\n" +
    "      class=\"top-menu\"\n" +
    "      nested-menu-collection\n" +
    "      property=\"\"\n" +
    "      current=\"obj\"\n" +
    "      ancestors=\"sg.defineAncestors\"\n" +
    "      all=\"obj.menu\"\n" +
    "      label-as=\"sg.labelAs\"\n" +
    "      empty-val=\"true\">\n" +
    "    </ul>\n" +
    "  </li>\n" +
    "</ul>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.sg/sg_grammar_reader.html',
    "<div ng-if=\"isVisible()\">\n" +
    "  <hr class=\"small\"/>\n" +
    "  <div id=\"sg-g-r\"/>\n" +
    "<div/>\n" +
    "\n"
  );

}]);
