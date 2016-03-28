'use strict';
angular.module('arethusa.core').constant('MORPH_TOOLS', {
  controller: 'MorphToolsCtrl',
  templateUrl: 'js/arethusa.tools/templates/morph_tools.html',
  resolve: {
    latinAttrs: [
      '$http',
      function($http) {
        return $http.get('js/arethusa.morph/configs/morph/lat_attributes.json');
      }
    ],
    greekAttrs: [
      '$http',
      function($http) {
        return $http.get('js/arethusa.morph/configs/morph/gr_attributes2.json');
      }
    ]
  }
});
