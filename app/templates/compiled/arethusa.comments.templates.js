angular.module('arethusa.comments').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.comments/comment.html',
    "<div class=\"comment\">\n" +
    "  <div class=\"comment-header\">\n" +
    "    <span><strong>{{ comment.user }}</strong></span>\n" +
    "    <span class=\"right note\">{{ comment.updated_at | date: 'short' }}</span>\n" +
    "  </div>\n" +
    "  <div class=\"comment-body\">\n" +
    "    <md ng-model=\"comment.comment\"/>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.comments/comment_creator.html',
    "<div>\n" +
    "  <div delimiter/>\n" +
    "  <div>\n" +
    "    <span\n" +
    "      ng-click=\"comments.creator = (!comments.creator && active)\"\n" +
    "      ng-disabled=\"!active\"\n" +
    "      class=\"button radius micro\"\n" +
    "      translate=\"comments.newComment\">\n" +
    "    </span>\n" +
    "    <span class=\"italic\">{{ currentTokenStrings }}</span>\n" +
    "  </div>\n" +
    "  <p>\n" +
    "    <div comment-input-form=\"comments.creator\" target=\"ids\">\n" +
    "  </p>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.comments/comment_filter.html',
    "<div class=\"small-12 columns\">\n" +
    "  <label>\n" +
    "    <span translate=\"comments.fullTextSearch\"/>\n" +
    "    <input\n" +
    "      type=\"search\"\n" +
    "      style=\"margin: 0\"\n" +
    "      ng-model=\"filter.fullText\"/>\n" +
    "  </label>\n" +
    "<div class=\"small-6 columns\">\n" +
    "  <label>\n" +
    "    <span translate=\"comments.filterSelected\"/>\n" +
    "    <input\n" +
    "      type=\"checkbox\"\n" +
    "      style=\"margin: 0\"\n" +
    "      ng-model=\"filter.selection\"/>\n" +
    "  </label>\n" +
    "</div>\n" +
    "<div class=\"small-6 columns\">\n" +
    "  <label\n" +
    "    class=\"right clickable\"\n" +
    "    tooltip-html-unsafe=\"{{ tooltip }}\"\n" +
    "    tooltip-popup-delay=\"700\"\n" +
    "    tooltip-placement=\"left\"\n" +
    "    ng-click=\"highlightCommented()\"\n" +
    "    ng-dblclick=\"selectCommented()\">\n" +
    "    <span\n" +
    "      translate=\"comments.count\"\n" +
    "      translate-value-count=\"{{ count }}\"\n" +
    "      translate-value-total=\"{{ total }}\"/>\n" +
    "  </label>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.comments/comment_input_form.html',
    "<form ng-if=\"active\">\n" +
    "  <!-- ngIf opens a new scope - we therefore need a -->\n" +
    "  <!-- parent reference in our model -->\n" +
    "  <textarea\n" +
    "    focus-me=\"active\"\n" +
    "    rows=\"3\"\n" +
    "    placeholder=\"{{ markdownPlaceholder}}\"\n" +
    "    ng-model=\"$parent.comment\"/>\n" +
    "  <span\n" +
    "    ng-disabled=\"!comment\"\n" +
    "    ng-click=\"submit()\"\n" +
    "    class=\"button micro radius\"\n" +
    "    translate=\"submit\">\n" +
    "  </span>\n" +
    "</form>\n"
  );


  $templateCache.put('templates/arethusa.comments/comment_targets.html',
    "<span translate=\"comments.on\"/>\n" +
    "<span ng-repeat=\"token in tokens\">\n" +
    "  <span\n" +
    "    class=\"normal-size\"\n" +
    "    token=\"token\"\n" +
    "    colorize=\"true\"\n" +
    "    click=\"true\"\n" +
    "    hover=\"true\">\n" +
    "  </span>\n" +
    "  <span>\n" +
    "  <span ng-if=\"nonSequential[$index]\">\n" +
    "    ...\n" +
    "  </span>\n" +
    "</span>\n"
  );


  $templateCache.put('templates/arethusa.comments/comments.directive.html',
    "<div class=\"comments\">\n" +
    "  <div class=\"italic\">\n" +
    "    <span comment-targets=\"tokens\"/>\n" +
    "    <span class=\"right\">\n" +
    "      <span class=\"button nano radius success\"\n" +
    "        ng-click=\"inputOpen = !inputOpen\">\n" +
    "        <i class=\"fa fa-reply\"></i>\n" +
    "      </span>\n" +
    "      <span class=\"button nano radius\"\n" +
    "        ng-click=\"select()\">\n" +
    "        <i class=\"fa fa-crosshairs\"></i>\n" +
    "      </span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "  <div\n" +
    "    class=\"fade-in\"\n" +
    "    ng-repeat=\"comment in comments.comments\"\n" +
    "    comment=\"comment\"/>\n" +
    "  <div class=\"text-center\">\n" +
    "    <div comment-input-form=\"inputOpen\" target=\"comments.ids\"/>\n" +
    "    <span class=\"ornament-delimiter\" style=\"margin-top: 0.5rem\"/>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.comments/comments.html',
    "<div comment-filter/>\n" +
    "<div comment-creator/>\n" +
    "<hr class=\"small\"/>\n" +
    "<div\n" +
    "  class=\"fade-in\"\n" +
    "  ng-repeat=\"comments in plugin.currentComments()\"\n" +
    "  comments-x=\"comments\">\n" +
    "</div>\n" +
    "<div delimier/>\n" +
    "<div comments-on-doc-level/>\n"
  );


  $templateCache.put('templates/arethusa.comments/comments_on_doc_level.html',
    "<div ng-if=\"count()\" class=\"comments\">\n" +
    "  <div ng-click=\"visible = !visible\">\n" +
    "    <span class=\"italic clickable\">\n" +
    "      <span translate=\"comments.docLevelComm\"/>\n" +
    "      <span>({{ count() }})</span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "  <div delimiter/>\n" +
    "  <div ng-if=\"visible\" class=\"fade fast\">\n" +
    "    <div ng-repeat=\"comment in c.docLevelComments\" comment=\"comment\"/>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.comments/context_menu.html',
    "<div>\n" +
    "  <span\n" +
    "    class=\"clickable\"\n" +
    "    ng-click=\"plugin.goToComments(token.id)\"\n" +
    "    ng-pluralize count=\"plugin.commentCountFor(token)\"\n" +
    "    when=\"{ '0': 'No comments', 'one': '1 comment', 'other': '{} comments'}\">\n" +
    " </span>\n" +
    "</div>\n"
  );

}]);
