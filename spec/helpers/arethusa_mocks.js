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
      delegateConf: mockFn,
      getStickyConf: mockFn,
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
      error: mockFn,
      wait: mockFn,
      warning: mockFn
    }, customizations);
  };

  this.plugins = function(customizations) {
    return withCustomizations({
      startUp: mockFn,
      init: mockFn,
      all: {},
      main: [],
      sub: [],
      withMenu: []
    });
  };

  this.tokens = function() {
    return {
      '01': {
        id: '01',
        string: 'Arma',
        relation: {
          label: "OBJ_CO"
        },
        morphology: {
          lemma: 'lemma1',
          postag: 'n-'
        }
      },
      '02': {
        id: '02',
        string: 'virum',
        relation: {
          label: "OBJ_CO"
        },
        morphology: {
          lemma: 'lemma2',
          postag: 'a1'
        }
      },
      '03': {
        id: '03',
        string: '-que',
        relation: {
          label: "COORD"
        }
      },
      '04': {
        id: '04',
        string: 'cano',
        relation: {
          label: "PRED"
        }
      }
    };
  };
}

var arethusaMocks = new ArethusaMocks();
