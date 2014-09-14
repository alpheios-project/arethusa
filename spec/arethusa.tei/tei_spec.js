"use strict";

describe('tei', function() {
  var tei;

  var conf = {};

  beforeEach(function() {
    module("arethusa.core");

    module('arethusa.tei');

    inject(function(_tei_, configurator) {
      tei = _tei_;
      configurator.defineConfiguration(conf);
      tei.init();
    });
  });

  // Write your specs here!
  it('succeeds to load the plugin', function() {
    expect(tei).toBeDefined();
  });
});
