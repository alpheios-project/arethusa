"use strict";

describe("idHandler", function() {
  beforeEach(module("arethusa.core"));

  var idHandler;
  beforeEach(inject(function(_idHandler_) {
    idHandler = _idHandler_;
  }));

  describe("this.decrement()", function() {
    it('decrements formatted ids', function() {
      expect(idHandler.decrement('0004')).toEqual('0003');
    });

    it('decrements ids that are extended with letters', function() {
      expect(idHandler.decrement('0004e')).toEqual('0004d');
    });
  });

  describe('this.increment()', function() {
    it('increments formatted ids', function() {
      expect(idHandler.increment('0004')).toEqual('0005');
    });

    it('increments ids that are extendend with letters', function() {
      expect(idHandler.increment('0004e')).toEqual('0004f');
    });
  });

  describe('this.isExtendedId()', function() {
    it('returns true when an id is extended', function() {
      expect(idHandler.isExtendedId('0003e')).toBeTruthy();
    });

    it('returns false when id is not extended', function() {
      expect(idHandler.isExtendedId('0004')).toBeFalsy();
    });
  });

  describe('this.extendId', function() {
    it('extends an id', function() {
      expect(idHandler.extendId('0003')).toEqual('0003e');
    });
  });

  describe('this.stripExtension', function() {
    it('stripts extender identifiers from an id', function() {
      expect(idHandler.stripExtension('0003e')).toEqual('0003');
    });

    it('returns the id when there is nothing to strip', function() {
      expect(idHandler.stripExtension('0003')).toEqual('0003');
    });
  });

  describe('this.nonSequentialIds', function() {
    it('takes an array of ids and returns indices of non sequential ids', function() {
      var ids = ['0001', '0002', '0004', '0006'];
      expect(idHandler.nonSequentialIds(ids)).toEqual({ 1: true, 2: true });
    });
  });
});
