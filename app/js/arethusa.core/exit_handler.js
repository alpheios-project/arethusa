"use strict";

angular.module('arethusa.core').service('exitHandler', [
  "$location",
  "$window",
  "configurator",
  function($location, $window, configurator) {
    var self = this;


    var conf = configurator.configurationFor('exitHandler') || {};

    // when it's not configured, we don't do anything
    this.defined = !angular.equals({}, conf);
    this.title = conf.title;

    var route = conf.route;
    var params = conf.params;

    function getParams() {
      return arethusaUtil.inject({}, params, function(memo, param) {
        memo[param] = $location.search()[param];
      });
    }


    function exitUrl() {
      var params = getParams();
      // build the real route
      return route;
    }

    this.leave = function(targetWin) {
      targetWin = targetWin || '_self';
      $window.open(exitUrl(), targetWin);
    };

  }
]);
