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

    function routeWithQueryParams(route, params) {
      if (!angular.equals({}, params)) {
        route = route+ "?";
        var queryStrings = arethusaUtil.inject([], params, function(memo, k, v) {
          memo.push(k + "=" + v);
        });
        route = route + queryStrings.join('&');
      }
      return route;
    }

    function exitUrl() {
      var params = getParams();
      var parsedRoute = route;
      var queryParams = arethusaUtil.inject({}, params, function(memo, param, val) {
        // checking for www.test.com/:param
        if (parsedRoute.indexOf(':' + param) > -1) {
          parsedRoute = parsedRoute.replace(':' + param, val);
        } else {
          memo[param] = val;
        }
      });

      return routeWithQueryParams(parsedRoute, queryParams);
    }

    this.leave = function(targetWin) {
      targetWin = targetWin || '_self';
      $window.open(exitUrl(), targetWin);
    };
  }
]);
