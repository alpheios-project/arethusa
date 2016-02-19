'use strict';
angular.module('arethusa.core').constant('MORPH_TOOLS', {
  controller: 'MorphToolsCtrl',
  templateUrl: 'templates/arethusa.tools/morph_tools.html',
  resolve: {
    latinAttrs: [
      '$http',
      function($http) {
        return $http.get('static/configs/morph/lat_attributes.json');
      }
    ],
    greekAttrs: [
      '$http',
      function($http) {
        return $http.get('static/configs/morph/gr_attributes2.json');
      }
    ]
  }
});
