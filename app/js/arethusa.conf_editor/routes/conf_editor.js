'use strict';
angular.module('arethusa.core').constant('CONF_ROUTE', {
  controller: 'ConfEditorCtrl',
  templateUrl: 'templates/conf_editor.html',
  resolve: {
    load: ['$http', 'configurator', function ($http, configurator) {
      var url = './static/configs/conf_editor/1.json';
      return $http.get(url).then(function (res) {
        configurator.defineConfiguration(res.data, url);
      });
    }]
  }
});
