"use strict";

describe('HistoryObj', function(){
  describe('new', function(){
    it('takes a max size as init value', function() {
      /* global HistoryObj */
      var hist = new HistoryObj(2);
      expect(hist.maxSize).toEqual(2);
    });
  });

  describe('push', function(){
    it('adds an element to the history', function() {
      /* global HistoryObj */
      var hist = new HistoryObj(2);
      hist.push({});
      expect(hist.elements[0]).toEqual({});
    });
  });
});
