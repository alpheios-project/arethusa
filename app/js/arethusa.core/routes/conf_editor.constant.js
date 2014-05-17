"use strict";

angular.module('arethusa.core').constant('CONF_ROUTE', {
  controller: 'ConfEditorCtrl',
  templateUrl: 'templates/conf_editor.html',
  resolve: {
    load: function($http, confUrl, configurator) {
      var url = confUrl();
      if (url) {
        return $http.get(url).then(function(res) {
          configurator.defineConfiguration(res.data, url);
        });
      } else {
        return configurator.loadConfTemplate;
      }
    }
  }
});
