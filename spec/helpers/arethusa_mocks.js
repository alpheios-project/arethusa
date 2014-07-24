"use strict";

function ArethusaMocks() {
  var self = this;

  function mockFn() {}
  function mockFnWithObject() { return {}; }

  function initOnly(customizations) {
    return withCustomizations({
      init: mockFn
    }, customizations);
  }

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

  this.saver = initOnly;
  this.history = initOnly;

  this.notifier = function(customizations) {
    return withCustomizations({
      init: mockFn,
      success: mockFn,
      info: mockFn,
      error: mockFn
    }, customizations);
  };
}

var arethusaMocks = new ArethusaMocks();
