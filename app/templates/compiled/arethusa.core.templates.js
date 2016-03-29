angular.module('arethusa.core').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.core/arethusa_grid.html',
    "<div gridster=\"grid.options\">\n" +
    "  <ul>\n" +
    "    <li\n" +
    "      gridster-item=\"item\"\n" +
    "      ng-style=\"item.style\"\n" +
    "      ng-repeat=\"item in grid.items track by item.plugin\">\n" +
    "      <arethusa-grid-handle>Handle</arethusa-grid-handle>\n" +
    "      <plugin name=\"{{ item.plugin }}\"></plugin>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/arethusa_grid_handle.html',
    "<div class=\"drag-handle-trigger\">\n" +
    "  <div class=\"drag-handle fade\" ng-show=\"visible\">\n" +
    "    <div class=\"drag-handle\">\n" +
    "      <span>{{ item.plugin }}</span>\n" +
    "      <span ng-show=\"plugin.settings\" settings-trigger=\"right\"/>\n" +
    "      <div ng-if=\"settingsOn\"\n" +
    "        style=\"padding: .3rem 1rem; text-align: right\"\n" +
    "        class=\"fade\">\n" +
    "        <div\n" +
    "          ng-repeat=\"setting in plugin.settings\">\n" +
    "          <div ng-if=\"setting.directive\" dynamic-directive=\"{{ setting.directive }}\"/>\n" +
    "          <div ng-if=\"!setting.directive\" plugin-setting/>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/arethusa_tabs.html',
    "<tabset>\n" +
    "  <tab\n" +
    "    ng-repeat=\"pl in tabs\"\n" +
    "    select=\"plugins.setActive(pl)\"\n" +
    "    heading=\"{{ pl.displayName }}\"\n" +
    "    active=\"plugins.isSelected(pl)\">\n" +
    "    <plugin\n" +
    "      name=\"{{ pl.name }}\"\n" +
    "      with-settings=\"true\"\n" +
    "      ng-if=\"plugins.isActive(pl)\">\n" +
    "    </plugin>\n" +
    "  </tab>\n" +
    "</tabset>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.core/arethusa_user.html',
    "<span>\n" +
    "  <a ng-href=\"{{ user.page }}\" target=\"_blank\">{{ name }}</a>\n" +
    "</span>\n" +
    "<span ng-if=\"withMail && user.mail\" style=\"margin-left: .5rem\">\n" +
    "  <a ng-href=\"mailto:{{ user.mail }}\">\n" +
    "    <i class=\"fi-mail\"></i>\n" +
    "  </a>\n" +
    "</span>\n"
  );


  $templateCache.put('templates/arethusa.core/chunk_mode_switcher.html',
    "<div>\n" +
    "  <label>\n" +
    "    <span translate=\"globalSettings.chunkMode\"/>\n" +
    "    <select\n" +
    "      style=\"width: 8rem\"\n" +
    "      class=\"compact\"\n" +
    "      ng-model=\"navi.chunkMode\"\n" +
    "      ng-change=\"navi.applyChunkMode()\"\n" +
    "      ng-options=\"mode as mode for mode in navi.chunkModes\">\n" +
    "    </select>\n" +
    "\n" +
    "    <form ng-submit=\"tryToSetChunkSize()\" style=\"display: inline-block\">\n" +
    "      <input\n" +
    "        style=\"width: 2rem\"\n" +
    "        class=\"compact\"\n" +
    "        type=\"text\" ng-model=\"size\"/>\n" +
    "    </form>\n" +
    "  </label>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.core/collected_plugin_settings.html',
    "<table class=\"plugin-settings\">\n" +
    "  <tr ng-repeat=\"plugin in plugins.all\" ng-if=\"plugin.settings\">\n" +
    "    <td class=\"name\">{{ plugin.displayName }}</td>\n" +
    "    <td ng-repeat=\"setting in plugin.settings\">\n" +
    "      <span ng-if=\"setting.directive\" dynamic-directive=\"{{ setting.directive }}\"/>\n" +
    "      <span ng-if=\"!setting.directive\" plugin-setting/>\n" +
    "    </td>\n" +
    "  </tr>\n" +
    "</table>\n"
  );


  $templateCache.put('templates/arethusa.core/colorizer_setting.html',
    "<label>\n" +
    "  <span translate=\"{{ setting.label }}\"/>\n" +
    "  <select\n" +
    "    style=\"width: 8rem\"\n" +
    "    class=\"compact\"\n" +
    "    ng-model=\"gS[setting.property]\"\n" +
    "    ng-change=\"gS.applyColorizer()\"\n" +
    "    ng-options=\"k as k for (k, v) in gS.colorizers\">\n" +
    "  </select>\n" +
    "</label>\n"
  );


  $templateCache.put('templates/arethusa.core/confirmation_dialog.html',
    "<div class=\"center\">\n" +
    "  <p class=\"italic bold \">\n" +
    "    {{ message }}\n" +
    "  </p>\n" +
    "  <div>\n" +
    "    <span\n" +
    "      ng-click=\"$close()\"\n" +
    "      class=\"button success success\"\n" +
    "      close-on-enter\n" +
    "      translate=\"yes\">\n" +
    "    </span>\n" +
    "    <span\n" +
    "      ng-click=\"$dismiss()\"\n" +
    "      class=\"button success alert\"\n" +
    "      translate=\"no\">\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.core/editors.html',
    "<ul ng-if=\"editors.editorsPresent\" class=\"no-list\">\n" +
    "  <li ng-repeat=\"(doc, users) in editors.perDocument\">\n" +
    "     <strong>{{ doc }}</strong>\n" +
    "     <ul class=\"no-list\">\n" +
    "       <li ng-repeat=\"user in users\">\n" +
    "          <div arethusa-user=\"user\" with-mail=\"true\"/>\n" +
    "       </li>\n" +
    "     </ul>\n" +
    "  </li>\n" +
    "</ul>\n" +
    "\n" +
    "<div ng-if=\"!editors.editorsPresent\" translate=\"editors.noEditorsPresent\"/>\n"
  );


  $templateCache.put('templates/arethusa.core/error_dialog.html',
    "<div class=\"center\">\n" +
    "  <p class=\"italic bold \">\n" +
    "    {{ message }}\n" +
    "  </p>\n" +
    "  <p class=\"error-modal-sendhint\" translate=\"errorDialog.sendHint\"/>\n" +
    "  <pre class=\"overflow-wrap-word\">\n" +
    "    {{ trace }}\n" +
    "  </pre>\n" +
    "  <div uservoice-embed target=\"error-uv-embedded\" class=\"error-modal\">\n" +
    "    <div class=\"error-uv-embedded\"></div>\n" +
    "  </div>\n" +
    "  <div class=\"center\">\n" +
    "    <span\n" +
    "      ng-click=\"$dismiss()\"\n" +
    "      class=\"button success alert\"\n" +
    "      translate=\"errorDialog.close\">\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.core/foreign_keys_help.html',
    "<div ng-if=\"visible\">\n" +
    "  <ul id=\"keyboard\">\n" +
    "    <li ng-repeat=\"key in keys\"\n" +
    "      id=\"{{ key.lower }}\"\n" +
    "      ng-click=\"generate(key.lower)\"\n" +
    "      ng-class=\"key.style.class\"\n" +
    "      class=\"keyboard-key\">\n" +
    "      <span ng-repeat=\"char in key.show\"\n" +
    "        class=\"shifted-{{$index}}\"\n" +
    "        ng-class=\"key.style.class[{{$index}}]\">{{ char }}</span>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "  <div delimiter/>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/global_click_action.html',
    "<label>\n" +
    "  <span translate=\"{{ setting.label }}\"/>\n" +
    "  <select\n" +
    "    style=\"width: 8rem\"\n" +
    "    class=\"compact\"\n" +
    "    ng-model=\"gS[setting.property]\"\n" +
    "    ng-change=\"gS.setClickAction(gS[setting.property])\"\n" +
    "    ng-options=\"k as k for (k, v) in gS.clickActions\">\n" +
    "  </select>\n" +
    "</label>\n"
  );


  $templateCache.put('templates/arethusa.core/global_settings_panel.html',
    "<div ng-if=\"active\" class=\"fade\">\n" +
    "  <p class=\"text\" translate=\"globalSettings.title\"/>\n" +
    "  <div class=\"small-12 columns scrollable text\">\n" +
    "    <ul class=\"no-list in-columns\" style=\"height: 240px\">\n" +
    "      <li\n" +
    "        class=\"fade\"\n" +
    "        ng-repeat=\"name in gS.settings | keys\"\n" +
    "        ng-init=\"setting = gS.settings[name]\">\n" +
    "        <div ng-switch=\"setting.type\">\n" +
    "          <div\n" +
    "            ng-switch-when=\"custom\"\n" +
    "            dynamic-directive=\"{{ setting.directive }}\"/>\n" +
    "          <div ng-switch-default>\n" +
    "            <input\n" +
    "              type=\"{{ setting.type }}\"\n" +
    "              ng-change=\"gS.propagateSetting(setting.property)\"\n" +
    "              ng-model=\"gS[setting.property]\"/>\n" +
    "            <label>\n" +
    "              <span translate=\"{{ setting.label }}\"/>\n" +
    "            </label>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <div\n" +
    "      ng-click=\"togglePluginSettings()\"\n" +
    "      translate=\"globalSettings.pluginSettings\"\n" +
    "      class=\"underline clickable\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div\n" +
    "      class=\"fade\"\n" +
    "      ng-if=\"pluginSettingsVisible\"\n" +
    "      collected-plugin-settings>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/grid_items.html',
    "<br/>\n" +
    "<div>\n" +
    "  <p class=\"text\">\n" +
    "    <span>Grid</span>\n" +
    "    <span translate=\"items\"></span>\n" +
    "  </p>\n" +
    "  <ul class=\"no-list in-columns\">\n" +
    "    <li ng-repeat=\"(name, status) in grid.itemList\">\n" +
    "      <input\n" +
    "        style=\"margin-bottom: 0.3rem\"\n" +
    "        type=\"checkbox\"\n" +
    "        ng-change=\"grid.toggleItem(name)\"\n" +
    "        ng-model=\"grid.itemList[name]\"/>\n" +
    "      <label>\n" +
    "        {{ name }}\n" +
    "      </label>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/grid_setting.html',
    "<div style=\"display: inline-block\">\n" +
    "  <p class=\"text\">\n" +
    "    <span>Grid</span>\n" +
    "    <span translate=\"settings\"></span>\n" +
    "  </p>\n" +
    "  <ul class=\"no-list\">\n" +
    "    <li ng-repeat=\"(key, value) in settings\">\n" +
    "      <input\n" +
    "        type=\"checkbox\"\n" +
    "        ng-model=\"settings[key]\"/>\n" +
    "      <label>\n" +
    "        <span translate=\"grid.{{ key }}\"/>\n" +
    "      </label>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/help_panel.html',
    "<div ng-if=\"active\" class=\"fade small-12-columns\">\n" +
    "  <div class=\"small-6 large-6 columns\">\n" +
    "    <div help-panel-item toggler=\"colors\" heading=\"helpPanel.colorLegends\" height=\"400px\">\n" +
    "      <ul class=\"no-list\" ng-repeat=\"(name, values) in gS.colorMaps()\">\n" +
    "        <li\n" +
    "          ng-class=\"{ 'active-colorizer': name === gS.colorizer }\">\n" +
    "          {{ name }}\n" +
    "        </li>\n" +
    "        <ul class=\"no-list\" ng-repeat=\"map in values.maps\">\n" +
    "          <li>\n" +
    "            {{ map.label }}\n" +
    "            <table class=\"small\">\n" +
    "              <tr>\n" +
    "                <th ng-repeat=\"header in values.header\">\n" +
    "                  <strong>{{ header }}</strong>\n" +
    "                </th>\n" +
    "              </tr>\n" +
    "              <tr ng-repeat=\"(k, col) in map.colors\">\n" +
    "                <td\n" +
    "                  ng-style=\"col\"\n" +
    "                  ng-repeat=\"val in k.split(' || ') track by $index\">\n" +
    "                  {{ val }}\n" +
    "                </td>\n" +
    "              </tr>\n" +
    "            </table>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "\n" +
    "    <div help-panel-item toggler=\"messages\" heading=\"messages\" height=\"200px\">\n" +
    "      <ul class=\"no-list\">\n" +
    "        <li ng-repeat=\"message in notifier.messages\">\n" +
    "          <div class=\"notification-list-item\">\n" +
    "            <span class=\"time\">{{ message.time | date: \"HH:mm:ss\" }}</span>\n" +
    "            <span class=\"message toast-{{ message.type }}\">{{ message.message }}</span>\n" +
    "          </div>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "\n" +
    "    <div help-panel-item toggler=\"editors\" heading=\"editors.title\" height=\"200px\">\n" +
    "      <div editors/>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"small-6 large-6 columns\">\n" +
    "    <div help-panel-item toggler=\"keys\" heading=\"helpPanel.keyboardShortcuts\" height=\"400px\">\n" +
    "      <ul class=\"no-list\" ng-repeat=\"(section, keys) in kC.activeKeys\">\n" +
    "        <li>{{ section }}</li>\n" +
    "        <table class=\"small\">\n" +
    "          <tr ng-repeat=\"(name, key) in keys\">\n" +
    "            <td><strong>{{ key }}</strong></td><td>{{ name}}</td>\n" +
    "          </tr>\n" +
    "        </table>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "\n" +
    "    <div help-panel-item toggler=\"about\" heading=\"helpPanel.about\" height=\"160px\">\n" +
    "      <ul class=\"no-list\">\n" +
    "        <li>\n" +
    "          <table class=\"small\">\n" +
    "            <tr>\n" +
    "              <td translate=\"helpPanel.revision\"/>\n" +
    "              <td>\n" +
    "                <a ng-href=\"{{ vers.commitUrl }}\" target=\"_blank\">\n" +
    "                  {{ vers.revision }}\n" +
    "                </a>\n" +
    "              </td>\n" +
    "            <tr>\n" +
    "            <tr>\n" +
    "              <!--This is untranslated on purpose!-->\n" +
    "              <td>Branch</td>\n" +
    "              <td>\n" +
    "                <a ng-href=\"{{ vers.branchUrl }}\" target=\"_blank\">\n" +
    "                  {{ vers.branch }}\n" +
    "                </a>\n" +
    "              </td>\n" +
    "            <tr>\n" +
    "            <tr>\n" +
    "              <td translate=\"date\"/>\n" +
    "              <td>{{ vers.date | date: 'medium' }}</td>\n" +
    "            </tr>\n" +
    "            <tr>\n" +
    "              <td translate=\"relocateHandler.title\"/>\n" +
    "              <td relocate/>\n" +
    "            </tr>\n" +
    "          </table>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/help_panel_item.html',
    "<div delimiter/>\n" +
    "<div class=\"text\">\n" +
    "  <div help-panel-heading toggler=\"{{ toggler }}\" heading=\"{{ heading }}\"/>\n" +
    "  <div\n" +
    "    class=\"small-12 columns scrollable slider\"\n" +
    "    style=\"height: {{ height }}\"\n" +
    "    ng-if=\"visible[toggler]\"\n" +
    "    ng-transclude>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/keys_to_screen.html',
    "<div id=\"keys-to-screen\">\n" +
    "  <span\n" +
    "    ng-repeat=\"key in keys\"\n" +
    "    class=\"key-to-screen\"\n" +
    "    ng-class=\"{ joiner: key.joiner }\">{{ key.str }}</span>\n" +
    "  <span ng-repeat=\"action in actions\"\n" +
    "    class=\"text italic right action\">\n" +
    "      {{ action.str }}\n" +
    "  </span>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/layout_setting.html',
    "<label>\n" +
    "  <span translate=\"{{ setting.label }}\"/>\n" +
    "  <select\n" +
    "    style=\"width: 8rem\"\n" +
    "    class=\"compact\"\n" +
    "    ng-model=\"gS[setting.property]\"\n" +
    "    ng-change=\"gS.broadcastLayoutChange()\"\n" +
    "    ng-options=\"layout.name for layout in gS.layouts\">\n" +
    "  </select>\n" +
    "</label>\n"
  );


  $templateCache.put('templates/arethusa.core/navbar_buttons.html',
    "<li><a class=\"button\" saver/></li>\n" +
    "<li><a class=\"button\" outputter/></li>\n" +
    "<li><a class=\"button\" hist-undo/></li>\n" +
    "<li><a class=\"button\" hist-redo/></li>\n" +
    "<li><a class=\"button\" sidepanel-folder/></li>\n" +
    "<li><a class=\"button\" uservoice-trigger/></li>\n" +
    "<li><a class=\"button\" global-settings-trigger/></li>\n" +
    "<li><a class=\"button\" help-trigger/></li>\n" +
    "<li><a class=\"button\" translate-language/></li>\n" +
    "<li><a class=\"button\" exit/></li>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.core/navbar_buttons_collapsed.html',
    "<li><a class=\"button\" saver/></li>\n" +
    "<li><a class=\"button\" hist-undo/></li>\n" +
    "<li><a class=\"button\" hist-redo/></li>\n" +
    "<li>\n" +
    "  <a\n" +
    "    class=\"button\"\n" +
    "    title=\"{{ menuTitle }}\"\n" +
    "    dropdown-toggle=\"#navbar_collapsed_buttons_menu\">\n" +
    "    <i class=\"fi-align-justify\"></i>\n" +
    "  </a>\n" +
    "  <ul id=\"navbar_collapsed_buttons_menu\" class=\"navbar-dropdown\">\n" +
    "    <li><a outputter/></li>\n" +
    "    <li><a sidepanel-folder/></li>\n" +
    "    <li><a uservoice-trigger/></li>\n" +
    "    <li><a help-trigger/></li>\n" +
    "    <li><a global-settings-trigger/></li>\n" +
    "    <li><a translate-language/></li>\n" +
    "    <li><a exit/></li>\n" +
    "  </ul>\n" +
    "</li>\n"
  );


  $templateCache.put('templates/arethusa.core/navbar_navigation.html',
    "<ul ng-show=\"showNavigation()\" class=\"navbar-navigation\">\n" +
    "  <li>\n" +
    "    <a>{{ navStat.citation }}</a>\n" +
    "  </li>\n" +
    "  <!--The wrapping divs around the a elements are only there for styling - the-->\n" +
    "  <!--foundation topbar gives them a differnet look and feel when they are wrapped.-->\n" +
    "  <li>\n" +
    "    <div>\n" +
    "      <a\n" +
    "        class=\"nav-link\"\n" +
    "        title=\"{{ trsls.goToFirst() }}\"\n" +
    "        ng-click=\"goToFirst()\"\n" +
    "        ng-class=\"{ disabled: !navStat.hasPrev }\">\n" +
    "        <i class=\"fi-previous\"></i>\n" +
    "      </a>\n" +
    "    </div>\n" +
    "  </li>\n" +
    "  <li>\n" +
    "  <div>\n" +
    "    <a\n" +
    "      class=\"nav-link\"\n" +
    "      title=\"{{ trsls.goToPrev(keys) }}\"\n" +
    "      ng-click=\"prev()\"\n" +
    "      ng-class=\"{ disabled: !navStat.hasPrev }\">\n" +
    "      <i class=\"fi-arrow-left\"></i>\n" +
    "    </a>\n" +
    "  </div>\n" +
    "  </li>\n" +
    "  <li>\n" +
    "    <div>\n" +
    "      <ul class=\"navigation\">\n" +
    "        <li>\n" +
    "          <a>\n" +
    "            {{ ids }}\n" +
    "          </a>\n" +
    "          <ul>\n" +
    "            <div class=\"navigation-menu small-12 large-12 columns\">\n" +
    "              <div>\n" +
    "                <form ng-submit=\"goTo(goToLocation)\">\n" +
    "                  <input class=\"inline\" type=\"text\" ng-model=\"goToLocation\"/>\n" +
    "                </form>\n" +
    "              </div>\n" +
    "              <div>\n" +
    "                <a sentence-list translate=\"list\"\n" +
    "                  title=\"{{ trsls.list(keys) }}\"/>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "          </ul>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </li>\n" +
    "  <li>\n" +
    "    <div>\n" +
    "      <a\n" +
    "        class=\"nav-link\"\n" +
    "        title=\"{{ trsls.goToNext(keys) }}\"\n" +
    "        ng-click=\"next()\"\n" +
    "        ng-class=\"{ disabled: !navStat.hasNext }\">\n" +
    "        <i class=\"fi-arrow-right\"></i>\n" +
    "    </a>\n" +
    "  </div>\n" +
    "  </li>\n" +
    "  <li>\n" +
    "    <div>\n" +
    "      <a\n" +
    "        class=\"nav-link\"\n" +
    "        title=\"{{ trsls.goToLast() }}\"\n" +
    "        ng-click=\"goToLast()\"\n" +
    "        ng-class=\"{ disabled: !navStat.hasNext }\">\n" +
    "        <i class=\"fi-next\"></i>\n" +
    "      </a>\n" +
    "    </div>\n" +
    "  </li>\n" +
    "</ul>\n"
  );


  $templateCache.put('templates/arethusa.core/navbar_notifier.html',
    "<ul ng-show=\"showNotifier()\">\n" +
    "  <span current-message/>\n" +
    "</ul>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.core/navbar_search.html',
    "<ul ng-show=\"showSearch()\">\n" +
    "  <li class=\"has-form\">\n" +
    "    <div class=\"row collapse\">\n" +
    "      <div class=\"large-10 small-10 columns\">\n" +
    "        <form ng-submit=\"search()\">\n" +
    "          <input\n" +
    "            type=\"text\"\n" +
    "            ng-model=\"query\"\n" +
    "            placeholder=\"{{ search_documents }}...\">\n" +
    "        </form>\n" +
    "      </div>\n" +
    "      <div class=\"large-2 small-2 columns\">\n" +
    "        <button class=\"alert button expand\" ng-click=\"search()\">\n" +
    "          <i class=\"fi-magnifying-glass\"></i>\n" +
    "        </button>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </li>\n" +
    "</ul>\n"
  );


  $templateCache.put('templates/arethusa.core/notifications.html',
    "<toaster-container\n" +
    "  toaster-options=\"{\n" +
    "    'close-button': true,\n" +
    "    'position-class': 'toast-bottom-right'\n" +
    "  }\">\n" +
    "</toaster-container>\n"
  );


  $templateCache.put('templates/arethusa.core/outputter.html',
    "<div class=\"outputter\">\n" +
    "  <div outputter-item ng-repeat=\"(name, obj) in saver.outputters\"/>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/outputter_item.html',
    "<div>\n" +
    "  <span class=\"italic\">{{ obj.identifier }}</span>\n" +
    "  <span class=\"buttons\">\n" +
    "    <span\n" +
    "      class=\"button radius micro\"\n" +
    "      ng-class=\"{ on: preview }\"\n" +
    "      ng-click=\"togglePreview()\"\n" +
    "      translate=\"preview\">\n" +
    "    </span>\n" +
    "    <span\n" +
    "      class=\"button radius micro\"\n" +
    "      ng-click=\"download()\"\n" +
    "      translate=\"download\">\n" +
    "    </span>\n" +
    "  </span>\n" +
    "</div>\n" +
    "<div delimiter/>\n" +
    "<div ng-if=\"preview\" hljs class=\"preview fade\" source=\"data()\"/>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.core/plugin.html',
    "<div\n" +
    "  id=\"{{ plugin.name }}\"\n" +
    "  class=\"fade very-slow\">\n" +
    "  <div ng-if=\"withSettings && plugin.settings\" plugin-settings/>\n" +
    "  <div ng-include=\"plugin.template\"/>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/plugin_setting.html',
    "<label ng-if=\"!setting.directive\" class=\"margined-hor-tiny\">\n" +
    "  {{ setting.label }}\n" +
    "  <input\n" +
    "    type=\"checkbox\"\n" +
    "    style=\"margin: 0\"\n" +
    "    ng-change=\"change()\"\n" +
    "    ng-model=\"plugin[setting.model]\"/>\n" +
    "</label>\n"
  );


  $templateCache.put('templates/arethusa.core/plugin_settings.html',
    "<div class=\"small-12 columns\">\n" +
    "  <span settings-trigger=\"right\"/>\n" +
    "  <span ng-show=\"settingsOn\">\n" +
    "    <span ng-repeat=\"setting in plugin.settings\" class=\"right\">\n" +
    "      <span ng-if=\"setting.directive\" dynamic-directive=\"{{ setting.directive }}\"/>\n" +
    "      <span ng-if=\"!setting.directive\" plugin-setting/>\n" +
    "    </span>\n" +
    "  </span>\n" +
    "</div>\n"
  );


  $templateCache.put('templates/arethusa.core/relocate.html',
    "<ul ng-if=\"locations\" class=\"no-list\">\n" +
    "  <li class=\"relocate-item clickable\" ng-repeat=\"location in locations\" ng-click=\"relocate(location)\">\n" +
    "    {{ location }}\n" +
    "  </li>\n" +
    "</ul>\n" +
    "<div ng-if=\"!locations\" translate=\"relocateHandler.noLocations\"/>\n"
  );


  $templateCache.put('templates/arethusa.core/sentence.html',
    "<div\n" +
    "  ng-click=\"goTo(id)\">\n" +
    "  <table class=\"sentence-list\" ng-class=\"{ changed: sentence.changed }\">\n" +
    "    <tr class=\"sentence-list\">\n" +
    "      <td>{{ citation }} {{ id }}</td>\n" +
    "      <td>{{ sentenceString }}</td>\n" +
    "    </tr>\n" +
    "  </table>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.core/settings_trigger.html',
    "<span\n" +
    "  class=\"clickable\"\n" +
    "  ng-click=\"settingsOn = !settingsOn\">\n" +
    "  <i class=\"fi-widget\" style=\"font-size: 1.2rem\"></i>\n" +
    "</span>\n" +
    "\n"
  );


  $templateCache.put('templates/arethusa.core/token_selector.html',
    "<dl class=\"sub-nav\" style=\"display:inline-block\">\n" +
    "  <dt\n" +
    "    style=\"color: #4D4D4D\"\n" +
    "    tooltip-popup-delay=\"700\"\\\n" +
    "    tooltip-placement=\"bottom\"\\\n" +
    "    tooltip-html-unsafe=\"{{ selection.tooltip }}\">\n" +
    "    {{ selection.label }}\n" +
    "  </dt>\n" +
    "  <dd ng-repeat=\"selector in selectors\" \n" +
    "      ng-class=\"{active: selector.isActive}\">\n" +
    "      <a\n" +
    "        ng-click=\"selector.action()\"\n" +
    "        ng-class=\"selector.styleClasses\"\n" +
    "        tooltip-popup-delay=\"700\"\\\n" +
    "        tooltip-placement=\"bottom\"\\\n" +
    "        tooltip-html-unsafe=\"{{ selector.tooltip }}\">\n" +
    "        {{selector.label}}\n" +
    "      </a>\n" +
    "  </dd>\n" +
    "</dl>\n"
  );


  $templateCache.put('templates/arethusa.core/translate_language.html',
    "<div class=\"flags {{ lang }}\"/>\n"
  );

}]);
