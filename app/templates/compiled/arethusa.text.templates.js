angular.module('arethusa.text').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.text/artificial_token_toggle.html',
    "<label>\n" +
    "  Hide artificial tokens\n" +
    "  <input\n" +
    "    type=\"checkbox\"\n" +
    "    style=\"margin: 0\"\n" +
    "    ng-model=\"text.hideArtificialTokens\"\n" +
    "    ng-change=\"text.setTokens()\"/>\n" +
    "</label>\n"
  );


  $templateCache.put('templates/arethusa.text/text_context.html',
    "<span\n" +
    "  ng-click=\"goToSentence()\"\n" +
    "  class=\"text-context\">\n" +
    "  {{ context }}\n" +
    "</span>\n"
  );

}]);
