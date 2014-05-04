"use strict";

/* global HistoryObj */

describe('HistoryObj', function(){
  var eventMock = { target : {}, property: 'x', oldVal: 0, newVal: 1};
  describe('new', function(){
    it('takes a max size as init value', function() {
      var hist = new HistoryObj(1);
      expect(hist.maxSize).toEqual(1);
    });

    it("never exceeds it's maxSize", function() {
      var hist = new HistoryObj(2);
      hist.save(eventMock);
      hist.save(eventMock);
      hist.save(eventMock);
      expect(hist.size()).toEqual(2);
    });

    it('discards older events when maxSize is reached', function() {
      var hist = new HistoryObj(2);
      var e1 = { e1: 1 };
      var e2 = { e2: 2 };
      var e3 = { e3: 3 };
      hist.save(e1);
      hist.save(e2);
      hist.save(e3);
      expect(hist.lastEvent()).toEqual(e3);
      expect(hist.elements).not.toContain(e1);
      expect(hist.elements).toContain(e2);
    });
  });

  describe('save', function(){
    it('saves an event to the history', function() {
      var hist = new HistoryObj(2);
      hist.save(eventMock);
      expect(hist.lastEvent()).toEqual(eventMock);
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
});
