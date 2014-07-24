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
}

var arethusaMocks = new ArethusaMocks();
