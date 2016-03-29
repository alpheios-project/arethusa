angular.module('arethusa.exercise').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.exercise/fill_in_the_blank.html',
    "<div class=\"small-12 columns small-text-center\" ng-hide=\"plugin.started\">\n" +
    "  <em>Read the instructions and hit start when you're ready</em>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"small-12 columns\" ng-show=\"plugin.started\">\n" +
    "  <p class=\"text-justify\">\n" +
    "  <span ng-repeat=\"(id, token) in state.tokens\">\n" +
    "    <span ng-if=\"plugin.isExerciseTarget(id)\">\n" +
    "      <span fill-in-the-blank-form></span>\n" +
    "      <span class=\"note\"><em>({{ plugin.hintFor(id) }})</em></span>\n" +
    "    </span>\n" +
    "    <span ng-if=\"! plugin.isExerciseTarget(id)\"\n" +
    "      hover=\"true\"\n" +
    "      token=\"token\">\n" +
    "    </span>\n" +
    "    <br ng-if=\"aU.isTerminatingPunctuation(token.string)\"/>\n" +
    "  </span>\n" +
    "  </p>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.exercise/fill_in_the_blank_form.html',
    "<input\n" +
    "  class=\"inline-form\"\n" +
    "  ng-class=\"validatedClass()\"\n" +
    "  type=\"text\"\n" +
    "  ng-model=\"plugin.answers[id]\">\n" +
    "</input>\n"
  );


  $templateCache.put('templates/arethusa.exercise/instructor.html',
    "<div class=\"small-text-center\">\n" +
    "  <em>Fill in the blanks!</em>\n" +
    "</div>\n" +
    "\n" +
    "<div style=\"margin-top: 2em\" class=\"small-text-center\">\n" +
    "  <button class=\"tiny radius\" ng-click=\"plugin.start()\" ng-show=\"! plugin.started\">Start</button>\n" +
    "  <button class=\"tiny radius\" ng-click=\"plugin.stop()\" ng-show=\"plugin.started\">Stop</button>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div style=\"margin-top: 2em\" class=\"small-text-center\" ng-if=\"plugin.done\">\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <span class=\"small-3 columns note\">\n" +
    "      <span class=\"right\">Time elapsed</span>\n" +
    "    </span>\n" +
    "    <span class=\"small-9 columns end\">\n" +
    "      <span class=\"left\">{{ plugin.time }}</span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"small-text-center\" style=\"margin-top: 20px\" ng-if=\"plugin.done\">\n" +
    "  <div style=\"margin-top: 20px\" class=\"small-12 columns\">\n" +
    "    <span class=\"small-3 columns note\">\n" +
    "      <span class=\"right right-answer\">Right answers</span>\n" +
    "    </span>\n" +
    "    <span class=\"small-9 columns end\">\n" +
    "      <span class=\"left\">{{ plugin.report.correct }}</span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <span class=\"small-3 columns note\">\n" +
    "      <span class=\"right wrong-answer\">Wrong answers</span>\n" +
    "    </span>\n" +
    "    <span class=\"small-9 columns end\">\n" +
    "      <span class=\"left\">{{ plugin.report.wrong }}</span>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div style=\"margin-top: 30px\" class=\"small-12 columns\">\n" +
    "  <ul>\n" +
    "    <li ng-repeat=\"token in plugin.report.tokens\" ng-if=\"! token.correct\">\n" +
    "      Right answer is {{ token.answer }}, you had {{ token.input }}\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n"
  );

}]);
