"use strict";

function ArethusaMocks() {
  var mockFn = function () {};
  var mockFnWithObject = function() { return {}; };

  this.configurator = function() {
    return {
      getConfAndDelegate: mockFn,
      provideResource: mockFnWithObject,
      configurationFor: mockFnWithObject,
      getRetrievers: mockFnWithObject
    };
  };

  this.keyCapture = function() {
    return {
      initCaptures: mockFnWithObject
    };
  };
}

var arethusaMocks = new ArethusaMocks();
