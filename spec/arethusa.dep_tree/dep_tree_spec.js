"use strict";

describe('depTree', function() {
  var depTree, globalSettings, state;

  var conf = {};

  beforeEach(function() {
    module("arethusa.core");

    module('arethusa.depTree');

    inject(function(_depTree_, _globalSettings_, _state_, configurator) {
      configurator.defineConfiguration(conf);
      depTree = _depTree_;
      globalSettings = _globalSettings_;
      state = _state_;
      state.initServices();
      state.replaceState(arethusaMocks.tokens());
      depTree.init();
    });
  });

  // Write your specs here!
  it('succeeds to load the plugin', function() {
    expect(depTree).toBeDefined();
  });

  describe('defines a click handler', function() {
    var clickAction;
    beforeEach(function() {
      var action = globalSettings.clickActions['change head'];
      clickAction = action[0];
    });

    it('adds the click handler to global settings as "change head"', function() {
      expect(clickAction).toBeDefined('change head');
    });

    /* Default tree:
     *     04:cano
     *        |
     *     03:-que
     *      /   \
     *  01:Arma 02:virum
     */
    it('allows to change heads', function() {
      // Produce a selection state
      state.selectToken('01', 'click');

      // Trigger the event which would have been caused by another click on token 04
      clickAction('04');

      expect(state.getToken('01').head.id).toBe('04');
    });

    /*
     *     04:cano
     *        |
     *     03:-que
     *        |
     *    02:virum
     *        |
     *     01:Arma
     */
    it('alloes to change heads II', function() {
      state.selectToken('01', 'click');
      clickAction('02');
      expect(state.getToken('01').head.id).toBe('02');
    });

    it('parents an inner node to a leaf node', function() {
      state.selectToken('03', 'click');

      clickAction('01');

      expect(state.getToken('03').head.id).toBe('01');
      expect(state.getToken('02').head.id).toBe('03');
      expect(state.getToken('01').head.id).toBe('04');
    });

    describe('with multiple selection', function() {
      /*
       *         04:cano
       *      /     |     \
       * 01:Arma 02:virum 03:-que
       */
      it('parents two leaf nodes to an inner node', function() {
        state.selectToken('01', 'click');
        state.selectToken('02', 'ctrl-click');

        clickAction('04');

        expect(state.getToken('01').head.id).toBe('04');
        expect(state.getToken('02').head.id).toBe('04');
        expect(state.getToken('03').head.id).toBe('04');
      });

      /*
       *     04:cano
       *        |
       *     03:-que
       *        |
       *    02:virum
       *        |
       *     01:Arma
       */
      it('ignores node in multiselection if it becomes head', function() {
        state.selectToken('01', 'click');
        state.selectToken('02', 'ctrl-click');

        clickAction('02');

        expect(state.getToken('01').head.id).toBe('02');
        expect(state.getToken('02').head.id).toBe('03');
      });
    });
  });
});
