"use strict";

/* global HistoryObj */

describe('HistoryObj', function(){
  var eventMock  = { target : {}, property: 'x', oldVal: 0, newVal: 1};
  var eventMock2 = { target : {}, property: 'x', oldVal: 2, newVal: 0};
  var eventMock3 = { target : {}, property: 'x', oldVal: 3, newVal: 0};

  describe('new', function(){
    it('takes a max size as init value', function() {
      var hist = new HistoryObj(1);
      expect(hist.maxSize).toEqual(1);
    });

    it("never exceeds it's maxSize", function() {
      var hist = new HistoryObj(2);
      hist.save(eventMock);
      hist.save(eventMock2);
      hist.save(eventMock3);
      expect(hist.size()).toEqual(2);
    });

    it('discards older events when maxSize is reached', function() {
      var hist = new HistoryObj(2);
      hist.save(eventMock);
      hist.save(eventMock2);
      hist.save(eventMock3);
      expect(hist.lastEvent).toEqual(eventMock3);
      expect(hist.elements).not.toContain(eventMock);
      expect(hist.elements).toContain(eventMock2);
    });
  });

  describe('save', function(){
    it('saves an event to the history', function() {
      var hist = new HistoryObj(2);
      hist.save(eventMock);
      expect(hist.lastEvent).toEqual(eventMock);
    });

    it("doesn't save the same event twice", function() {
      var hist = new HistoryObj(2);
      hist.save(eventMock);
      hist.save(eventMock);
      expect(hist.size()).toEqual(1);
    });

    it("doesn't save a circular history (i.e. an undo event)", function() {
      var hist = new HistoryObj(2);
      var target = {};
      var e1 = { target: target, property: 'x', oldVal: 1, newVal: 2};
      var e2 = { target: target, property: 'x', oldVal: 2, newVal: 1};
      target.x = 1;
      hist.save(e1);
      hist.save(e2);
      expect(hist.lastEvent).toBe(e1);
    });
  });

  describe('canBeUndone', function(){
    it('returns false when there is no history to be undone', function() {
      var hist = new HistoryObj(2);
      expect(hist.canBeUndone()).toBeFalsy();
    });

    it('returns true when there is something to be undone', function() {
      var hist = new HistoryObj(2);
      hist.save(eventMock);
      expect(hist.canBeUndone()).toBeTruthy();
    });
  });

  describe('canBeRedone', function(){
    it('returns false when nothing can be redone', function() {
      var hist = new HistoryObj(2);
      expect(hist.canBeRedone()).toBeFalsy();
    });

    it('returns true when something can be redone', function() {
      var hist = new HistoryObj(2);
      hist.save(eventMock);
      hist.undo();
      expect(hist.canBeRedone()).toBeTruthy();
    });
  });

  describe('lastEvent', function(){
    it('holds a reference to the last event that was saved', function() {
      var hist = new HistoryObj(2);
      hist.save(eventMock);
      expect(hist.lastEvent).toBe(eventMock);
    });
  });
});
