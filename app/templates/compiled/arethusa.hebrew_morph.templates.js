angular.module('arethusa.hebrewMorph').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.hebrew_morph/hebrew_morph.html',
    "<div ng-repeat=\"(id, analysis) in plugin.currentSelection()\">\n" +
    "  <div class=\"small-12 columns\" lang-specific>\n" +
    "    <p token-with-id value=\"analysis.string\" token-id=\"id\"/>\n" +
    "    <accordion close-others=\"oneAtATime\">\n" +
    "      <accordion-group ng-repeat=\"form in analysis.forms\">\n" +
    "        <accordion-heading class=\"text\">\n" +
    "          <span class=\"right\" ng-style=\"plugin.styleOf(form)\">\n" +
    "            {{ plugin.hyphenatedForm(form) }}\n" +
    "          </span>\n" +
    "          <span class=\"left\">{{ form.score }}</span>\n" +
    "          <hr class=\"small\">\n" +
    "        </accordion-heading>\n" +
    "      </accordion-group>\n" +
    "    </accordion>\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
