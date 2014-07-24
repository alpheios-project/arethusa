"use strict";

function ArethusaMocks() {
  var mockFn = function () {};
  var mockFnWithObject = function() { return {}; };

  function withCustomizations(obj, overrides) {
    return angular.extend(obj, overrides);
  }

  this.configurator = function(customizations) {
    return withCustomizations({
      getConfAndDelegate: mockFn,
      provideResource: mockFnWithObject,
      configurationFor: mockFnWithObject,
      getRetrievers: mockFnWithObject
    }, customizations);
  };

  this.keyCapture = function(customizations) {
    return withCustomizations({
      initCaptures: mockFnWithObject
    }, customizations);
  };
}

var arethusaMocks = new ArethusaMocks();
