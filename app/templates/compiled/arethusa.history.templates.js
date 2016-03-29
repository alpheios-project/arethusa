angular.module('arethusa.history').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.history/history_batch.html',
    "<span ng-repeat=\"e in events\" history-event=\"e\"/>\n"
  );


  $templateCache.put('templates/arethusa.history/history_event.html',
    "<div>\n" +
    "  <span\n" +
    "    translate=\"{{ trslKey.start }}\"\n" +
    "    translate-value-property=\"{{ property }}\">\n" +
    "  </span>\n" +
    "  <span id=\"token\"/>\n" +
    "  <sup class=\"note\"> {{ formatId(id) }} </sup>\n" +
    "  <span\n" +
    "    translate=\"{{ trslKey.end }}\"\n" +
    "    translate-value-property=\"{{ property }}\">\n" +
    "  </span>\n" +
    "  <span ng-if=\"type === 'change' && !blocked\">\n" +
    "    <span\n" +
    "      translate=\"history.fromTo\"\n" +
    "      translate-value-from=\"{{ oldVal }}\"\n" +
    "      translate-value-to=\"{{ newVal }}\">\n" +
    "    </span>\n" +
    "  </span>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.history/history_list.html',
    "<div class=\"small-12 columns\">\n" +
    "  <ol reversed>\n" +
    "    <p ng-if=\"events.length === 0\" class=\"text\">\n" +
    "      <span translate=\"history.noRecords\"/>\n" +
    "    </p>\n" +
    "    <li\n" +
    "      ng-repeat=\"e in events\"\n" +
    "      ng-class=\"{ 'current-hist-event': $index === position }\"\n" +
    "      class=\"text hist-event\">\n" +
    "      <span ng-switch=\"e.type\" >\n" +
    "        <span ng-switch-when=\"batch\" history-batch=\"e\"/>\n" +
    "        <span ng-switch-default history-event=\"e\"/>\n" +
    "      </span>\n" +
    "    </li>\n" +
    "  </ol>\n" +
    "</div>\n"
  );

}]);
