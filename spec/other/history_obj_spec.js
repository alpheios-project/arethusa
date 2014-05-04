"use strict";

describe('HistoryObj', function(){
  var eventMock = { target : {}, property: 'x', oldVal: 0, newVal: 1};
  describe('new', function(){
    it('takes a max size as init value', function() {
      /* global HistoryObj */
      var hist = new HistoryObj(2);
      expect(hist.maxSize).toEqual(2);
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
