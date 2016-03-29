angular.module('arethusa.review').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.review/context_menu.html',
    "<div>\n" +
    "  <div\n" +
    "    ng-repeat=\"(cat, diff) in token.diff\"\n" +
    "    review-element=\"cat\"\n" +
    "    diff=\"diff\">\n" +
    "  </div>\n" +
    "  <hr ng-if=\"token.diff\" class=\"small\"/>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.review/review.html',
    "<div class=\"small-12 columns\" ng-if=\"!plugin.hideMode\">\n" +
    "  <span>\n" +
    "    <span class=\"settings-span-button right\" review-linker/>\n" +
    "    <span>\n" +
    "      <label class=\"margined-hor-tiny right\"> Auto-compare\n" +
    "        <input type=\"checkbox\" ng-model=\"plugin.autoDiff\"/>\n" +
    "      </label>\n" +
    "    </span>\n" +
    "  </span>\n" +
    "</div>\n" +
    "<div review-stats ng-if=\"plugin.diffActive\"/>\n" +
    "<div delimiter/>\n" +
    "<div class=\"small-12 columns\">\n" +
    "  <div ng-class=\"{ 'tree-canvas': !plugin.hideMode }\">\n" +
    "    <div class=\"tree-settings\">\n" +
    "      <span class=\"button radius tiny right\" ng-click=\"plugin.compare()\">Compare</span>\n" +
    "    <div>\n" +
    "    <div\n" +
    "      ng-if=\"!plugin.hideMode\"\n" +
    "      dependency-tree\n" +
    "      tokens=\"plugin.goldTokens\"\n" +
    "      to-bottom\n" +
    "      class=\"full-width\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.review/review_diff_report.html',
    "<div class=\"columns\" ng-repeat=\"(id, diff) in rev.diff\">\n" +
    "  <div\n" +
    "    token=\"id\"\n" +
    "    colorize=\"true\"\n" +
    "    click=\"true\"\n" +
    "    hover=\"true\"\n" +
    "    highlight=\"true\">\n" +
    "  </div>\n" +
    "  <div ng-if=\"!rev.hideMode\">\n" +
    "    <ul class=\"no-list\">\n" +
    "      <li ng-repeat=\"(cat, res) in diff\">\n" +
    "        <div review-element=\"cat\" diff=\"res\"/>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.review/review_element_head.html',
    "<div class=\"text\">\n" +
    "  <span class=\"review-el-cat\">{{ cat }}</span>\n" +
    "  <span\n" +
    "    class=\"error-message-dark\"\n" +
    "    token=\"wrong\"\n" +
    "    click=true\n" +
    "    hover=true>\n" +
    "  </span>\n" +
    "  <span margin=\"0 .3rem\">↛</span>\n" +
    "  <span\n" +
    "    class=\"success-message-dark\"\n" +
    "    token=\"right\"\n" +
    "    click=true\n" +
    "    hover=true>\n" +
    "  </span>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.review/review_element_morphology.html',
    "<div class=\"text\">\n" +
    "  <span class=\"review-el-cat\">{{ cat }}</span>\n" +
    "  <span ng-switch=\"errors.length\">\n" +
    "    <span ng-switch-when=\"1\">\n" +
    "      <span class=\"error-message-dark\">{{ errors[0][0] }}</span>\n" +
    "      <span margin=\"0 .3rem\">↛</span>\n" +
    "      <span class=\"success-message-dark\">{{ errors[0][1] }}</span>\n" +
    "    </span>\n" +
    "    <span ng-switch-when=\"2\">\n" +
    "      <span class=\"error-message-dark\">{{ errors[0][0] }}</span>\n" +
    "      <span margin=\"0 .3rem\">↛</span>\n" +
    "      <span class=\"success-message-dark\">{{ errors[0][1] }}</span>\n" +
    "      <br/>\n" +
    "      <span class=\"review-el-cat\"/>\n" +
    "      <span class=\"error-message-dark\">{{ errors[1][0] }}</span>\n" +
    "      <span margin=\"0 .3rem\">↛</span>\n" +
    "      <span class=\"success-message-dark\">{{ errors[1][1] }}</span>\n" +
    "    </span>\n" +
    "  </span>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.review/review_element_relation.html',
    "<div class=\"text\">\n" +
    "  <span class=\"review-el-cat\">{{ cat }}</span>\n" +
    "  <span class=\"error-message-dark\">{{ wrong }}</span>\n" +
    "  <span margin=\"0 .3rem\">↛</span>\n" +
    "  <span class=\"success-message-dark\">{{ right }}</span>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.review/review_linker.html',
    "<span\n" +
    "  class=\"clickable flash-on-hover\"\n" +
    "  ng-click=\"review.link = !review.link\">\n" +
    "  <i class=\"fa fa-{{ icon }}\"></i>\n" +
    "</span>\n"
  );


  $templateCache.put('templates/arethusa.review/review_stats.html',
    "<div\n" +
    "  ng-click=\"openStats = !openStats\"\n" +
    "  class=\"small-12 columns text center clickable\"\n" +
    "  style=\"padding: 0.2rem 0; background-color: {{ rgbCode }}\">\n" +
    "  {{ tokens }} tokens and {{ attrs }} attributes with differences\n" +
    "</div>\n" +
    "<div ng-if=\"openStats\" class=\"small-12 columns fade slide-right\">\n" +
    "  <div delimiter/>\n" +
    "  <div review-diff-report/>\n" +
    "</div>\n"
  );

}]);
