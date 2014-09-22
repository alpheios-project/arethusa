'use strict';
angular.module('arethusa.core').constant('LANDING', {
  controller: 'LandingCtrl',
  template: '\
    <div style="height: 100%; overflow: auto">\
      <div\
        ng-include="template"\
         class="fade slow">\
      </div>\
    </div>\
  ',
  resolve: {
    scrollBody: function() {
      angular.element(document.body).css('overflow', 'auto');
    },
    conf: ['configurator', function(configurator) {
      configurator.defineConfiguration({
        navbar: {
          template: 'templates/navbar_landing.html'
        }
      });
    }]
  }
});
