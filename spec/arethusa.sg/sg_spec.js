"use strict";

describe("sg", function() {
  var confCustom = {
    getConfAndDelegate: function(name, obj) {
      var labels = {
        NOUN: { long: "noun", dependency: { pos: "noun" } },
        VERB : { long : "verb", dependency : { pos : "verb" }, }
      };
      obj.conf = {labels: labels};
    }
  };

  var sg, state;

  beforeEach(function() {
    module("arethusa.core", function($provide) {
      $provide.value('configurator', arethusaMocks.configurator(confCustom));
    });

    module("arethusa.sg");

    inject(function(_sg_, _state_) {
      state = _state_;
      state.tokens = arethusaMocks.tokens();
      sg = _sg_;
      sg.init();
    });
  });
});
