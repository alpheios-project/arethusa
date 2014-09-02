'use strict';
angular.module('arethusa.core').constant('MAIN_ROUTE', {
  controller: 'ArethusaCtrl',
  template: '\
    <div>\
      <arethusa-navbar></arethusa-navbar>\
      <div\
        ng-include="gS.layout"\
         class="fade slow">\
      </div>\
    </div>\
  ',
  resolve: {
    loadConfiguration: ['$http', 'confUrl', 'configurator', function ($http, confUrl, configurator) {
      var url = confUrl(true);
      return $http.get(url).then(function (res) {
        configurator.defineConfiguration(res.data, url);
      });
    }]
  }
});
