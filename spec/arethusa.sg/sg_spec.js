"use strict";

describe("sg", function() {
  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },
    getRetrievers: function(name) {
      return {};
    },
    getConfAndDelegate: function(name, obj) {
      var labels = {
        NOUN: { long: "noun", dependency: { pos: "noun" } },
        VERB : { long : "verb", dependency : { pos : "verb" }, }
      };
        obj.conf = {labels: labels};
      }
    };

    var createTokens = function() {
    return {
      '01': {
        id: '01',
        string: 'Arma',
      },
      '02': {
        id: '02',
        string: 'virum',
      },
      '03': {
        id: '03',
        string: 'cano',
      }
    };
  };

  beforeEach(module("arethusa.core", function($provide) {
    $provide.value('configurator', mockConfigurator);
  }));

  beforeEach(module("arethusa.sg"));

  var sg;
  var state;
  beforeEach(inject(function(_sg_, _state_) {
    state = _state_;
    state.tokens = createTokens();
    sg = _sg_;
    sg.init();
  }));
});
