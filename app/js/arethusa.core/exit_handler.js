"use strict";

/**
 * @ngdoc service
 * @name arethusa.core.exitHandler
 *
 * @description
 * Allows to define an exit route of the application.
 *
 * Needs to be defined in a configuration file and uses the following format
 *
 * ```
 *   "exitHandler" : {
 *     "title" : "readable string of the route",
 *     "route" : "http path to your exit target",
 *     "params" : [ 'query', 'params' ]
 *   }
 * ```
 *
 * @requires $location
 * @requires $window
 * @requires arethusa.core.configurator
 *
 */

angular.module('arethusa.core').service('exitHandler', [
  "$location",
  "$window",
  "configurator",
  "$analytics",
  '$rootScope',
  function(
    $location,
    $window,
    configurator,
    $analytics,
    $rootScope
  ) {
    var LEAVE_EVENT = 'exit:leave';
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

    this.leave = leave;
    this.onLeave = onLeave;
    this.triggerLeaveEvent = triggerLeaveEvent;

    /**
     * @ngdoc function
     * @name arethusa.core:exitHandler#leave
     * @methodOf arethusa.core.exitHandler
     *
     * @description
     * Leaves arethusa to the configured route.
     *
     * @param {string} [targetWin='_self'] The target window.
     */
    function leave(targetWin) {
      $analytics.eventTrack('exit', {
        category: 'actions', label: 'exit'
      });

      targetWin = targetWin || '_self';
      triggerLeaveEvent();
      $window.open(exitUrl(), targetWin);
    }

    function onLeave(cb) {
      $rootScope.$on(LEAVE_EVENT, cb);
    }

    function triggerLeaveEvent() {
      $rootScope.$broadcast(LEAVE_EVENT);
    }
  }
]);
