angular.module('arethusa').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/conf_editor.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <div class=\"colums small-12\">\n" +
    "    <h3>Conf editor</h3>\n" +
    "      <strong>{{ fileName() }}</strong>\n" +
    "    <div>\n" +
    "      <ul class=\"button-group right\">\n" +
    "        <li><button ng-click=\"save()\" class=\"small\">Save</button></li>\n" +
    "        <li><button ng-clikc=\"saveAs()\" class=\"small\">Save as...</button></li>\n" +
    "        <!--needs something like dropdown where we can enter a new filename-->\n" +
    "        <li><button ng-click=\"reset()\" class=\"small\">Reset</button></li>\n" +
    "        <li><button ng-click=\"toggleDebugMode()\" class=\"small\">Debug</button></li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div debug=\"conf\"></div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <div class=\"columns large-12\">\n" +
    "    <div class=\"columns large-3\">\n" +
    "      <simple-form text=\"Main Template\" model=\"main().template\"></simple-form>\n" +
    "      <input type=\"checkbox\" ng-model=\"main().colorize\"/><label>Colorize tokens</label>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <h5>Data Sources</h5>\n" +
    "    <!--this is going to be a directive once the markup takes-->\n" +
    "    <!--more shape-->\n" +
    "    <ul class=\"button-group\">\n" +
    "      <li ng-repeat=\"(name, conf) in main().retrievers\"\n" +
    "          ng-click=\"toggleSelection('source', name)\">\n" +
    "        <span class=\"tiny button\">\n" +
    "          {{ name }}\n" +
    "        </span>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "    <div ng-repeat=\"(name, conf) in main().retrievers\" ng-show=\"isSelected('source', name)\">\n" +
    "      <!--\n" +
    "        Note on the remover attribute: We pass a function here through a\n" +
    "        one-way binding here. This function takes an argument, in this case\n" +
    "        removePlugin() takes the name of the plugin to remove. The name of this\n" +
    "        param in the attribute declaration is meaningless. It's just here to tell\n" +
    "        the pluginConf directive (which is in an isolated scope) that the function\n" +
    "        in fact takes an argument. It wouldn't need to be name here, it could be\n" +
    "        'foo' too.\n" +
    "      -->\n" +
    "      <retriever-conf\n" +
    "        name=\"name\"\n" +
    "        retriever=\"main().retrievers[name]\"\n" +
    "        remover=\"removeDataSource(name)\">\n" +
    "      </retriever-conf>\n" +
    "    </div>\n" +
    "    <conf-adder\n" +
    "      text=\"Add a data source\"\n" +
    "      submitter=\"addDataSource(input)\">\n" +
    "    </conf-adder>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <h5>Plugins</h5>\n" +
    "  <div>\n" +
    "    <ul class=\"button-group\">\n" +
    "      <li ng-repeat=\"name in main().plugins\">\n" +
    "        <span\n" +
    "          class=\"tiny button\"\n" +
    "          ng-class=\"{alert: isMainPlugin(name)}\"\n" +
    "          ng-click=\"toggleSelection('plugin', name)\">\n" +
    "          {{ name }}\n" +
    "        </span>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "  <div ng-repeat=\"name in main().plugins\" ng-show=\"isSelected('plugin', name)\">\n" +
    "    <plugin-conf name=\"name\"></plugin-conf>\n" +
    "  </div>\n" +
    "  <conf-adder\n" +
    "    text=\"Add a plugin\"\n" +
    "    submitter=\"addPlugin(input)\">\n" +
    "  </conf-adder>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <h5>Resources</h5>\n" +
    "  <div>\n" +
    "    <ul class=\"button-group\">\n" +
    "      <li ng-repeat=\"(name, resource) in resources()\">\n" +
    "        <span class=\"tiny button\" ng-click=\"toggleSelection('resource', name)\">\n" +
    "          {{ name }}\n" +
    "        </span>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "  <div ng-repeat=\"(name, resource) in resources()\" ng-show=\"isSelected('resource', name)\">\n" +
    "    <resource-conf\n" +
    "      name=\"name\"\n" +
    "      resource=\"resource\"\n" +
    "      remover=\"removeResource(name)\">\n" +
    "    </resource-conf>\n" +
    "  </div>\n" +
    "  <conf-adder\n" +
    "    text=\"Create a resource\"\n" +
    "    submitter=\"addResource(input)\">\n" +
    "  </conf-adder>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <h5>Navbar</h5>\n" +
    "  <div class=\"columns large-3\">\n" +
    "    <simple-form text=\"Template\" model=\"navbar().template\"></simple-form>\n" +
    "    <span ng-repeat=\"key in navbarBooleans\">\n" +
    "      <input type=\"checkbox\" ng-model=\"navbar()[key]\"/><label>{{ key }}</label>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/dep_tree.html',
    "<div class=\"tree-canvas\">\n" +
    "  <div class=\"tree-settings\">\n" +
    "    <span token-selector=\"state.tokens\"></span>\n" +
    "    <span\n" +
    "      class=\"note right settings-span-button\"\n" +
    "      ng-show=\"plugin.diffPresent\"\n" +
    "      ng-click=\"plugin.toggleDiff()\">\n" +
    "      Toggle Diff\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div\n" +
    "    lang-specific\n" +
    "    dependency-tree\n" +
    "    tokens=\"state.tokens\"\n" +
    "    styles=\"plugin.diffStyles()\"\n" +
    "    to-bottom>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/dep_tree2.html',
    "<div>\n" +
    "  <div class=\"tree-settings\">\n" +
    "    <span token-selector=\"state.tokens\"></span>\n" +
    "    <span\n" +
    "      class=\"note right settings-span-button\"\n" +
    "      ng-show=\"plugin.diffPresent\"\n" +
    "      ng-click=\"plugin.toggleDiff()\">\n" +
    "      Toggle Diff\n" +
    "    </span>\n" +
    "    <span\n" +
    "      class=\"note right settings-span-button\"\n" +
    "      style=\"margin-left: 10px\"\n" +
    "      unused-token-highlighter\n" +
    "      uth-check-property=\"head.id\">\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div\n" +
    "    lang-specific\n" +
    "    dependency-tree\n" +
    "    tokens=\"state.tokens\"\n" +
    "    styles=\"plugin.diffStyles()\"\n" +
    "    to-bottom>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/exercise_demo.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "<p/>\n" +
    "<div id=\"canvas\" class=\"row panel full-height\" full-height>\n" +
    "  <div id=\"main-body\" class=\"columns small-7\">\n" +
    "    <div ng-repeat=\"pl in mainPlugins\">\n" +
    "      <plugin name=\"pl\"/>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div id=\"sidepanel\" class=\"columns small-5\">\n" +
    "    <div id=\"sidepanel-resizer\" full-height resizable></div>\n" +
    "    <div id=\"sidepanel-body\">\n" +
    "      <tabset>\n" +
    "        <tab\n" +
    "          ng-click=\"declareActive(pl.name)\"\n" +
    "          ng-repeat=\"pl in subPlugins\"\n" +
    "          heading=\"{{ pl.name }}\">\n" +
    "          <plugin name=\"pl\" ng-if=\"isActive(pl)\"/>\n" +
    "        </tab>\n" +
    "      </tabset>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/external_history.html',
    "<p>(jQuery implementation)</p>\n" +
    "\n" +
    "<span id=\"undo\" class=\"label radius\">Undo</span>\n" +
    "<span id=\"redo\" class=\"label radius\">Redo</span>\n" +
    "<div id=\"ext-hist-elements\"></div>\n" +
    "\n" +
    "<script src=\"./js/other/external_history.js\"></script>\n"
  );


  $templateCache.put('templates/history.html',
    "<div>\n" +
    "  <span class=\"settings-span-button right\" hist-redo/>\n" +
    "  <span class=\"settings-span-button right\" hist-undo/>\n" +
    "  <div delimiter/>\n" +
    "  <div history-list/>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/landing_page.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "\n" +
    "<div class=\"canvas-border\"></div>\n" +
    "\n" +
    "<div class=\"panel row large-12 columns\">\n" +
    "  <div class=\"section\">\n" +
    "    <a href=\"https://github.com/latin-language-toolkit/arethusa\"><img style=\"position: absolute; top: 0; right: 0; border: 0;\" src=\"https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67\" alt=\"Fork me on GitHub\" data-canonical-src=\"https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png\"/></a>\n" +
    "    <p class=\"italic\"><span translate=\"landing.description\"/></p>\n" +
    "\n" +
    "    <div style=\"margin: auto\">\n" +
    "      <img src=\"../dist/examples/images/grid.png\" style=\"display: block; padding: 0 2rem; margin: auto\"/>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div class=section>\n" +
    "    <h3><span translate=\"useCases\"/></h3>\n" +
    "    <p><span translate=\"landing.modularNature\"/></p>\n" +
    "\n" +
    "    <div class=\"large-12 columns\">\n" +
    "      <div ng-repeat=\"useCase in useCases\">\n" +
    "        <h3 class=\"italic\"><span translate=\"{{ useCase.name }}\"/></h4>\n" +
    "        <div ng-repeat=\"example in useCase.examples\">\n" +
    "          <div\n" +
    "            class=\"large-4 columns panel clickable\"\n" +
    "            ng-click=\"goTo(example.url)\">\n" +
    "            <h4 translate=\"{{ example.name }}\"></h4>\n" +
    "            <img ng-src=\"{{ example.img }}\"/>\n" +
    "            <p>{{ example.caption }}</p>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div class=\"section\">\n" +
    "    <h3><span translate=\"gettingStarted\"/></h3>\n" +
    "    <iframe width=\"640\" height=\"360\" src=\"//www.youtube.com/embed/FbRRoVnVuDs\" frameborder=\"0\" allowfullscreen></iframe>\n" +
    "    <iframe width=\"640\" height=\"360\" src=\"//www.youtube.com/embed/hp-bhasd96g\" frameborder=\"0\" allowfullscreen></iframe>\n" +
    "    <p>\n" +
    "    <a href=\"http://sites.tufts.edu/perseids/instructions/screencasts/\"><span translate=\"landing.moreScreencasts\"/></a>\n" +
    "    </p>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div class=\"section\">\n" +
    "    <h3><span translate=\"development\"/></h3>\n" +
    "    <p><span translate=\"landing.devDescription\"/></p>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div style=\"section\">\n" +
    "    <h3><span translate=\"landing.partners\"/></h3>\n" +
    "    <div class=\"large-12 columns\">\n" +
    "      <div class=\"img-container\" style=\"display: inline-block\">\n" +
    "        <a href=\"{{ partners[0].href }}\">\n" +
    "          <img class=\"center\" style=\"height: 200px\" ng-src=\"{{ partners[0].img }}\"/>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "      <div class=\"img-container\" style=\"display: inline-block\">\n" +
    "        <a href=\"{{ partners[1].href }}\">\n" +
    "          <img class=\"center\" style=\"height: 150px\" ng-src=\"{{ partners[1].img }}\"/>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "      <div class=\"img-container\" style=\"display: inline-block\">\n" +
    "        <a href=\"{{ partners[2].href }}\" target=\"_blank\">\n" +
    "          <img class=\"center\" style=\"height: 70px; margin: 2rem\" ng-src=\"{{ partners[2].img }}\"/>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "      <div class=\"img-container\" style=\"display: inline-block\">\n" +
    "        <a href=\"{{ partners[3].href }}\" target=\"_blank\">\n" +
    "          <img class=\"center\" style=\"height: 200px\" ng-src=\"{{ partners[3].img }}\"/>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <p>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div style=\"section\">\n" +
    "    <h3><span translate=\"landing.awards\"/></h3>\n" +
    "    <div class=\"large-12 columns\">\n" +
    "      <div class=\"img-container\" style=\"display: inline-block\">\n" +
    "        <a href=\"{{ awards[0].href }}\">\n" +
    "          <img class=\"center\" style=\"height: 120px\" ng-src=\"{{ awards[0].img }}\"/>\n" +
    "        </a>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"large-12 columns\" style=\"padding: 1rem 0\"/>\n" +
    "\n" +
    "  <div>\n" +
    "    <h3><span translate=\"landing.funders\"/></h3>\n" +
    "    <p><span translate=\"landing.fundersDescription\"/></p>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('templates/main.html',
    "<div class=\"row panel\">\n" +
    "  <div class=\"columns small-12\">\n" +
    "    <h3>Main Controller</h3>\n" +
    "    Selected tokens: {{ state.currentTokensAsStringList() }}\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-repeat=\"pl in plugins\" class=\"row panel\">\n" +
    "  <div class=\"columns small-12\">\n" +
    "    <plugin name=\"{{ pl }}\"/>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/main2.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <div class=\"columns small-12\">\n" +
    "    <div>\n" +
    "      <h3>Main State</h3>\n" +
    "      <p>\n" +
    "        {{ state.selectedTokens }}\n" +
    "        <button deselector class=\"right small\">Deselect all</button>\n" +
    "        <button ng-click=\"toggleDebugMode()\" class=\"right small\">Debug</button>\n" +
    "      </p>\n" +
    "    </div>\n" +
    "    <div debug=\"state.tokens\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"row panel full-height\">\n" +
    "  <div class=\"columns small-6\">\n" +
    "    <div ng-repeat=\"pl in mainPlugins\">\n" +
    "      <plugin name=\"pl\"/>\n" +
    "      <hr>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"columns small-6\">\n" +
    "    <tabset>\n" +
    "      <tab ng-repeat=\"pl in subPlugins\" heading=\"{{ pl.name }}\">\n" +
    "        <plugin name=\"pl\"/>\n" +
    "      </tab>\n" +
    "    </tabset>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/main3.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "\n" +
    "<div class=\"canvas-border\"></div>\n" +
    "\n" +
    "<div class=\"panel\">\n" +
    "<a href=\"https://github.com/latin-language-toolkit/arethusa\"><img style=\"position: absolute; top: 0; right: 0; border: 0;\" src=\"https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67\" alt=\"Fork me on GitHub\" data-canonical-src=\"https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png\"></a>\n" +
    "<h3>Arethusa</h3>\n" +
    "<p>TODO description</p>\n" +
    "\n" +
    "<h3>Use cases or configurations</h3>\n" +
    "<p>Through its modular nature Arethusa can be configured for different use cases:<p>\n" +
    "TODO\n" +
    "<div class=\"row\" data-equalizer>\n" +
    "  <div class=\"large-4 columns panel\" data-equalizer-watch>\n" +
    "    <h4>Treebanking</h4>\n" +
    "    TODO description\n" +
    "    <a href=\"/app/#/staging2?doc=1&s=2\">Example</a>\n" +
    "    TODO image\n" +
    "  </div>\n" +
    "  <div class=\"large-4 columns panel\" data-equalizer-watch>\n" +
    "    <h4>Review mode</h4>\n" +
    "    <a href=\"/app/#/review_test?doc=1&gold=11\">Example</a>\n" +
    "  </div>\n" +
    "  <div class=\"large-4 columns panel\" data-equalizer-watch>\n" +
    "    <h4>Review mode</h4>\n" +
    "    <a href=\"/app/#/review_test?doc=1&gold=11\">Example</a>\n" +
    "  </div>\n" +
    "</div>\n" +
    "The new Grid layout\n" +
    "http://localhost:8081/app/#/staging3?doc=1\n" +
    "\n" +
    "\n" +
    "\n" +
    "A Greek document, including the SG plugin\n" +
    "http://localhost:8081/app/#/sg?doc=athenaeus12&s=1\n" +
    "\n" +
    "An empty document to play around (saving disabled)\n" +
    "http://localhost:8081/app/#/clean?doc=clean1\n" +
    "\n" +
    "<h3>Getting started</h3>\n" +
    "<iframe width=\"640\" height=\"360\" src=\"//www.youtube.com/embed/FbRRoVnVuDs\" frameborder=\"0\" allowfullscreen></iframe>\n" +
    "<iframe width=\"640\" height=\"360\" src=\"//www.youtube.com/embed/hp-bhasd96g\" frameborder=\"0\" allowfullscreen></iframe>\n" +
    "<p>\n" +
    "<a href=\"http://sites.tufts.edu/perseids/instructions/screencasts/\">More screencasts</a>\n" +
    "</p>\n" +
    "\n" +
    "<h3>Development</h3>\n" +
    "<p>\n" +
    "Arethusa is built on the <a href=\"https://angularjs.org/angular.js\">AngularJS</a> javascript web application framework \n" +
    "and provides a back-end independent plugin infrastructure for accessing texts, annotations and linguistic services from a variety of sources. \n" +
    "Extensibility is a guiding design goal - Arethusa includes tools for automatic generation of new plugin skeletons \n" +
    "(<a href=\"https://github.com/latin-language-toolkit/arethusa-cli\">Arethusa::CLI</a>) and detailed development guides are currently in progress (TODO link?), \n" +
    "with the hopes that others will be able to reuse and build upon the platform to add support for other annotation types, \n" +
    "languages and back-end repositories and workflow engines.\n" +
    "</p>\n" +
    "\n" +
    "\n" +
    "<h3>Funders</h3>\n" +
    "<p>This project has received support from the <a href=\"http://www.mellon.org/\">Andrew W. Mellon Foundation</a> and the <a href=\"http://imls.gov/\">Institute of Museum and Library Services</a>.</p>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('templates/main_grid.html',
    "<div>\n" +
    "  <div id=\"arethusa-editor\">\n" +
    "    <div class=\"canvas-border\"/>\n" +
    "\n" +
    "    <div arethusa-grid/>\n" +
    "\n" +
    "    <div arethusa-context-menus tokens=\"state.tokens\" plugins=\"plugins.withMenu\"/>\n" +
    "  </div>\n" +
    "  <div notifications/>\n" +
    "  <div id=\"arethusa-sentence-list\" class=\"hide\"/>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/main_with_sidepanel.html',
    "<div>\n" +
    "  <div id=\"arethusa-editor\">\n" +
    "    <div class=\"canvas-border\"/>\n" +
    "\n" +
    "    <div id=\"canvas\" class=\"row panel full-height\" full-height>\n" +
    "      <div id=\"main-body\" to-bottom>\n" +
    "        <div ng-repeat=\"pl in plugins.main\" plugin name=\"{{ pl.name }}\"/>\n" +
    "        <div keys-to-screen/>\n" +
    "      </div>\n" +
    "\n" +
    "      <div id=\"sidepanel\" sidepanel to-bottom class=\"scrollable\">\n" +
    "        <div id=\"sidepanel-resizer\" resizable to-bottom></div>\n" +
    "        <div id=\"sidepanel-body\" arethusa-tabs=\"plugins.sub\"/>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div arethusa-context-menus tokens=\"state.tokens\" plugins=\"plugins.withMenu\"/>\n" +
    "  </div>\n" +
    "  <div notifications/>\n" +
    "  <div id=\"arethusa-sentence-list\" class=\"hide\"/>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/morph.html',
    "<h3>Morph plugin</h3>\n" +
    "<ul>\n" +
    "  <li ng-repeat=\"analysis in plugin.currentAnalyses()\">\n" +
    "    Forms of {{ analysis.string}}\n" +
    "    <ol>\n" +
    "      <li ng-repeat=\"form in analysis.forms\">\n" +
    "        <morph-form></morph-form>\n" +
    "      </li>\n" +
    "    </ol>\n" +
    "  </li>\n" +
    "</ul>\n"
  );


  $templateCache.put('templates/morph2.html',
    "<div class=\"right\">\n" +
    "  <prev-token><span class=\"label radius\">prev</span></prev-token>\n" +
    "  <next-token><span class=\"label radius\">next</span></next-token>\n" +
    "</div>\n" +
    "\n" +
    "<!--{{ plugin.analyses }}-->\n" +
    "\n" +
    "<div ng-repeat=\"(id, analysis) in plugin.currentAnalyses()\">\n" +
    "  <p token-with-id value=\"analysis.string\" token-id=\"id\"/>\n" +
    "  <accordion close-others=\"oneAtATime\">\n" +
    "    <accordion-group ng-repeat=\"form in analysis.forms\" >\n" +
    "      <accordion-heading>\n" +
    "         <div class=\"row\">\n" +
    "           <div class=\"columns small-5\">\n" +
    "             • <span ng-style=\"plugin.styleOf(form)\">{{ form.lemma }}\n" +
    "             <br>\n" +
    "             </span> {{ plugin.concatenatedAttributes(form) }}\n" +
    "           </div>\n" +
    "           <div class=\"columns small-2\">{{ form.postag }}</div>\n" +
    "           <div class=\"columns small-2 note\">{{ form.origin }}</div>\n" +
    "           <div form-selector class=\"columns small-2 right end\"></div>\n" +
    "         </div>\n" +
    "      </accordion-heading>\n" +
    "      <morph-form-edit></morph-form-edit>\n" +
    "    </accordion-group>\n" +
    "    <accordion-group heading=\"Create new form\">\n" +
    "      <morph-form-create></morph-form-create>\n" +
    "    </accordion-group>\n" +
    "  </accordion>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/morph3.html',
    "<div\n" +
    "  class=\"note right span-settings-button\"\n" +
    "  style=\"margin-top: 10px\"\n" +
    "  unused-token-highlighter\n" +
    "  uth-check-property=\"morphology\"\n" +
    "  uth-auxiliary-property=\"postag\">\n" +
    "</div>\n" +
    "\n" +
    "<div ng-repeat=\"(id, analysis) in plugin.currentAnalyses()\">\n" +
    "  <div class=\"small-12 columns\" lang-specific>\n" +
    "    <p token-with-id value=\"analysis.string\" token-id=\"id\"/>\n" +
    "    <p ng-if=\"plugin.gloss\">\n" +
    "      <label>\n" +
    "        <span translate=\"morph.lemmaTranslation\"/>\n" +
    "        <input class=\"compact\"\n" +
    "          type=\"text\"\n" +
    "          ng-change=\"plugin.updateGloss(id)\"\n" +
    "          ng-model=\"analysis.gloss\">\n" +
    "        </input>\n" +
    "      </label>\n" +
    "    </p>\n" +
    "    <accordion close-others=\"oneAtATime\">\n" +
    "      <accordion-group\n" +
    "        ng-repeat=\"form in analysis.forms\"\n" +
    "        is-open=\"plugin.expandSelection && form.selected\">\n" +
    "        <accordion-heading>\n" +
    "          <div class=\"row\" accordion-highlighter>\n" +
    "            <div form-selector class=\"columns large-1 small-1\"></div>\n" +
    "            <div class=\"columns large-3 small-5 text\">\n" +
    "              <span ng-style=\"plugin.styleOf(form)\" lang-specific>{{ form.lemma }}\n" +
    "              <br>\n" +
    "              </span> {{ plugin.concatenatedAttributes(form) }}\n" +
    "            </div>\n" +
    "            <div\n" +
    "              class=\"columns large-4 small-5 postag\">\n" +
    "              {{ form.postag }}\n" +
    "            </div>\n" +
    "            <div class=\"columns large-1 hide-for-small hide-for-medium note end\">{{ form.origin }}</div>\n" +
    "          </div>\n" +
    "          <hr class=\"small\">\n" +
    "        </accordion-heading>\n" +
    "        <div class=\"small-12 columns\" morph-form-attributes=\"form\" token-id=\"id\"></div>\n" +
    "        <p class=\"small-12 columns\"/>\n" +
    "        <hr>\n" +
    "      </accordion-group>\n" +
    "    </accordion>\n" +
    "  </div>\n" +
    "  <div ng-if=\"plugin.canEdit()\">\n" +
    "    <div class=\"small-6 columns\">\n" +
    "      <button\n" +
    "        reveal-toggle=\"mfc{{ id }}\"\n" +
    "        class=\"micro radius\">\n" +
    "        <span translate=\"morph.createNewForm\"/>\n" +
    "      </button>\n" +
    "    </div>\n" +
    "    <morph-form-create\n" +
    "      id=\"mfc{{ id }}\"\n" +
    "      morph-id=\"id\"\n" +
    "      morph-token=\"analysis\"\n" +
    "      class=\"hide\">\n" +
    "    </morph-form-create>\n" +
    "  </div>\n" +
    "  <div delimiter/>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/morph_form.html',
    "<ul>\n" +
    "  <li ng-repeat=\"(attr, val) in form.attributes\">\n" +
    "    {{ plugin.longAttributeName(attr) }}: {{ plugin.abbrevAttributeValue(attr, val) }}\n" +
    "  </li>\n" +
    "</ul>\n"
  );


  $templateCache.put('templates/morph_form_create.html',
    "<div class=\"small-6 columns\">\n" +
    "  <ul class=\"button-group right\">\n" +
    "    <li>\n" +
    "      <span\n" +
    "        class=\"button micro radius\"\n" +
    "        ng-click=\"reset()\"\n" +
    "        translate=\"reset\">\n" +
    "      </span>\n" +
    "    </li>\n" +
    "    <li>\n" +
    "      <span\n" +
    "        class=\"button micro radius\"\n" +
    "        ng-click=\"save(mFCForm.$valid)\"\n" +
    "        translate=\"save\">\n" +
    "      </span>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n" +
    "\n" +
    "<div delimiter></div>\n" +
    "\n" +
    "<form name=\"mFCForm\">\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <alert\n" +
    "      ng-if=\"alert\"\n" +
    "      class=\"radius center fade-in error\"\n" +
    "      close=\"resetAlert()\">\n" +
    "      {{ translations.createError() }}\n" +
    "    </alert>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"small-12 columns\">\n" +
    "    <div class=\"small-3 columns\">\n" +
    "      <label class=\"right\">Lemma</label>\n" +
    "    </div>\n" +
    "    <div class=\"small-9 columns\">\n" +
    "      <ng-form\n" +
    "        id=\"lemma-form\"\n" +
    "        tooltip-placement=\"top\"\n" +
    "        tooltip=\"{{ lemmaHint }}\">\n" +
    "        <input\n" +
    "          foreign-keys\n" +
    "          class=\"compact error\"\n" +
    "          type=\"text\"\n" +
    "          required\n" +
    "          ng-change=\"declareOk()\"\n" +
    "          ng-model=\"form.lemma\">\n" +
    "        </input>\n" +
    "      </ng-form>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div\n" +
    "    ng-repeat=\"attr in visibleAttributes\"\n" +
    "    ng-init=\"options= m.attributeValues(attr)\">\n" +
    "    <div class=\"small-12 columns\">\n" +
    "      <div class=\"small-3 columns\">\n" +
    "        <label class=\"right\">{{ m.longAttributeName(attr) }}</label>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"small-9 columns\">\n" +
    "        <select\n" +
    "          class=\"compact\"\n" +
    "          required\n" +
    "          ng-model=\"form.attributes[attr]\"\n" +
    "          ng-options=\"options[key].long for key in options | keys\"\n" +
    "          ng-change=\"m.updatePostag(form, attr, form.attributes[attr])\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</form>\n"
  );


  $templateCache.put('templates/morph_form_edit.html',
    "<div class=\"row\" ng-repeat=\"(attr, val) in form.attributes\">\n" +
    "  <div class=\"small-3 columns\">\n" +
    "    <label class=\"right\">{{ plugin.longAttributeName(attr) }}</label>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"small-9 columns\">\n" +
    "    <select\n" +
    "      ng-model=\"form.attributes[attr]\"\n" +
    "      ng-init=\"opt.short\"\n" +
    "      ng-options=\"name as opt.long for (name, opt) in plugin.attributeValues(attr)\"\n" +
    "      fire-event=\"{target: 'form', property: 'attr', value: 'val'}\"\n" +
    "      synchronize-postag=\"{form: 'form', attr: 'attr', val: 'val'}\">\n" +
    "    </select>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<small ng-show=\"form.lexInvUri\">Lexical Inventory: {{ form.lexInvUri }}</small>\n"
  );


  $templateCache.put('templates/morph_import.html',
    "<div class=\"row\">\n" +
    "  <h3>Arethusa Morph Helper</h3>\n" +
    "\n" +
    "  <div class=\"fade\" ng-if=\"ready\">\n" +
    "    <ul>\n" +
    "      <li ng-repeat=\"file in files\">\n" +
    "        <a ng-click=\"loadCsvFile(file)\">{{ file.name }}</a>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "\n" +
    "  <div>\n" +
    "    <button class=\"small rounded\" ng-click=\"importFile()\">Import from file</button>\n" +
    "    <button class=\"small rounded\" ng-click=\"exportFile()\">Export to file</button>\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-if=\"status.import.count\">\n" +
    "    {{ status.import.count}} forms successfully imported!\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-if=\"status.export.count\">\n" +
    "    {{ status.export.count}} forms successfully exported!\n" +
    "  </div>\n" +
    "\n" +
    "  <div ng-if=\"importStarted\" style=\"color: green\">\n" +
    "    Processing import...\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n"
  );


  $templateCache.put('templates/navbar1.html',
    "<div class=\"fixed\">\n" +
    "  <nav class=\"top-bar\" data-topbar>\n" +
    "    <ul class=\"title-area\">\n" +
    "      <li class=\"name\">\n" +
    "      <h1><a href=\"#\"><img ng-src=\"{{ logo }}\"/></a></h1>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "    <section class=\"top-bar-section\">\n" +
    "      <ul navbar-search/>\n" +
    "      <ul navbar-navigation/>\n" +
    "      <ul navbar-buttons class=\"right\"/>\n" +
    "    </section>\n" +
    "  </nav>\n" +
    "</div>\n" +
    "<div help-panel class=\"hide row panel\"/>\n" +
    "<div global-settings-panel class=\"hide row panel\"/>\n"
  );


  $templateCache.put('templates/navbar_landing.html',
    "<div class=\"fixed\">\n" +
    "  <nav class=\"top-bar\" data-topbar>\n" +
    "    <ul class=\"title-area\">\n" +
    "      <li class=\"name\">\n" +
    "      <h1><a href=\"#\"><img ng-src=\"{{ logo }}\"/></a></h1>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "    <section class=\"top-bar-section\">\n" +
    "      <ul class=\" has-form right\">\n" +
    "        <li><a class=\"button\" translate-language/></li>\n" +
    "      </ul>\n" +
    "    </section>\n" +
    "  </nav>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/relation.html',
    "<div\n" +
    "  class=\"note right span-settings-button\"\n" +
    "  style=\"margin-top: 10px\"\n" +
    "  unused-token-highlighter\n" +
    "  uth-check-property=\"relation.label\">\n" +
    "</div>\n" +
    "\n" +
    "<div ng-if=\"plugin.advancedMode\">\n" +
    "  <div relation-multi-changer class=\"small-12 columns\"/>\n" +
    "  <div delimiter/>\n" +
    "</div>\n" +
    "\n" +
    "<div ng-repeat=\"(id, obj) in plugin.currentLabels()\">\n" +
    "    <div class=\"small-12 columns\" style=\"padding-bottom: 1rem\">\n" +
    "      <div token-with-id value=\"obj.string\" token-id=\"id\" style=\"padding-bottom: .4rem\"/>\n" +
    "      <div label-selector obj=\"obj.relation\"/>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('templates/search.html',
    "<div class=\"small-12 columns\">\n" +
    "  <div search-by-string/>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"small-12 columns\" ng-repeat=\"pl in plugin.searchPlugins\">\n" +
    "  <div plugin-search=\"pl\"></div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"small-12 columns\">\n" +
    "  <label class=\"inline\">\n" +
    "    <span translate=\"search.foundTokens\"/>\n" +
    "  </label>\n" +
    "  <ul lang-specific>\n" +
    "    <li\n" +
    "      ng-repeat=\"(id, type) in state.selectedTokens\"\n" +
    "      class=\"fade fast clickable\"\n" +
    "      ng-mouseenter=\"hovered = true\"\n" +
    "      ng-mouseleave=\"hovered = false\"\n" +
    "      ng-class=\"{ 'search-result-hovered': hovered }\"\n" +
    "      ng-click=\"state.deselectToken(id, type)\"\n" +
    "      token-with-id\n" +
    "      value=\"state.asString(id)\"\n" +
    "      token-id=\"id\">\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/sg.html',
    "<div class=\"small-12 columns\">\n" +
    "  <div ng-repeat=\"(id, grammar) in plugin.currentGrammar()\">\n" +
    "    <p token-with-id value=\"grammar.string\" token-id=\"id\"/>\n" +
    "    <p class=\"text\" style=\"margin-left: 0.75rem\">{{ grammar.hint }}</p>\n" +
    "    <div ng-hide=\"grammar.hint\">\n" +
    "      <div sg-ancestors=\"grammar\"/>\n" +
    "      <br/>\n" +
    "      <ul ng-if=\"plugin.canEdit()\" class=\"nested-dropdown\">\n" +
    "        <li class=\"first-item\">Select Smyth Categories\n" +
    "          <ul\n" +
    "            class=\"top-menu\"\n" +
    "            nested-menu-collection\n" +
    "            property=\"\"\n" +
    "            current=\"grammar\"\n" +
    "            ancestors=\"plugin.defineAncestors\"\n" +
    "            all=\"grammar.menu\"\n" +
    "            label-as=\"plugin.labelAs\"\n" +
    "            empty-val=\"true\">\n" +
    "          </ul>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div sg-grammar-reader>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/text.html',
    "<h3>Text plugin</h3>\n" +
    "<table>\n" +
    "  <tr>\n" +
    "    <td ng-repeat=\"token in state.tokens\">\n" +
    "      {{ token.id }}\n" +
    "    </td>\n" +
    "  </tr>\n" +
    "  <tr>\n" +
    "      <!--this mouse behavior should get moved\n" +
    "          inside the token directive eventually-->\n" +
    "    <td\n" +
    "      ng-repeat=\"token in state.tokens\"\n" +
    "      ng-click=\"state.toggleSelection(token.id, 'click')\"\n" +
    "      ng-mouseenter=\"state.selectToken(token.id, 'hover')\"\n" +
    "      ng-mouseleave=\"state.deselectToken(token.id, 'hover')\">\n" +
    "      <token ng-class=\"{selected: state.isSelected(token.id)}\"></token>\n" +
    "    </td>\n" +
    "  </tr>\n" +
    "</table>\n"
  );


  $templateCache.put('templates/text2.html',
    "<p lang-specific>\n" +
    "  <span ng-repeat=\"token in plugin.tokens\">\n" +
    "    <span\n" +
    "      token=\"token\"\n" +
    "      colorize=\"true\"\n" +
    "      click=\"true\"\n" +
    "      hover=\"true\"\n" +
    "      highlight=\"true\">\n" +
    "    </span>\n" +
    "    <!--Deactivated for now - not safe to use with ellipsis-->\n" +
    "    <!--<br ng-if=\"token.terminator && !$last\"/>-->\n" +
    "  </span>\n" +
    "</p>\n"
  );


  $templateCache.put('templates/text_with_context.html',
    "<p lang-specific>\n" +
    "  <span\n" +
    "    ng-if=\"plugin.showContext\"\n" +
    "    text-context=\"plugin.context.pre\">\n" +
    "  </span>\n" +
    "  <span ng-repeat=\"token in plugin.tokens\">\n" +
    "    <span\n" +
    "      token=\"token\"\n" +
    "      colorize=\"true\"\n" +
    "      click=\"true\"\n" +
    "      hover=\"true\"\n" +
    "      highlight=\"true\">\n" +
    "    </span>\n" +
    "  </span>\n" +
    "  <span\n" +
    "    ng-if=\"plugin.showContext\"\n" +
    "    text-context=\"plugin.context.post\">\n" +
    "  </span>\n" +
    "</p>\n" +
    "\n"
  );


  $templateCache.put('templates/token.html',
    "<!--tcm is for tokenContextMenu-->\n" +
    "<span\n" +
    "  ng-class=\"selectionClass()\"\n" +
    "  context-menu\n" +
    "  menu-trigger=\"rightclick\"\n" +
    "  menu-id=\"tcm{{ token.id }}\"\n" +
    "  menu-position=\"bottom\"\n" +
    "  menu-obj=\"token\">{{ token.string }}</span>\n"
  );


  $templateCache.put('templates/tree.html',
    "<arethusa-navbar></arethusa-navbar>\n" +
    "\n" +
    "<div class=\"row panel\">\n" +
    "  <div class=\"columns small-12\">\n" +
    "    <div>\n" +
    "      <h3>Main State</h3>\n" +
    "      <p>\n" +
    "        {{ state.selectedTokens }}\n" +
    "        <button deselector class=\"right small\">Deselect all</button>\n" +
    "        <button ng-click=\"toggleDebugMode()\" class=\"right small\">Debug</button>\n" +
    "      </p>\n" +
    "    </div>\n" +
    "    <div debug=\"state.tokens\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<div class=\"row panel full-height\">\n" +
    "  <div class=\"columns small-12\">\n" +
    "    <div ng-repeat=\"pl in mainPlugins\">\n" +
    "      <plugin name=\"pl\"/>\n" +
    "      <hr>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n"
  );

}]);
