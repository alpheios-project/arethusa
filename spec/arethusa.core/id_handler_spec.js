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

    it('works correctly with %s-%w ids', function() {
      expect(idHandler.increment('0001-0004')).toEqual('0001-0005');
    });
  });

  describe('this.isExtendedId()', function() {
    it('returns true when an id is extended', function() {
      expect(idHandler.isExtendedId('0003e')).toBeTruthy();
    });

    it('returns false when id is not extended', function() {
      expect(idHandler.isExtendedId('0004')).toBeFalsy();
    });

    it('works correctly with %s-%w ids', function() {
      expect(idHandler.decrement('0001-0005')).toEqual('0001-0004');
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

  describe('this.padIdWithSId', function() {
    it('adds a sentence id identification to an id', function() {
      var id  = '0004e';
      var sentenceId = '1';
      expect(idHandler.padIdWithSId(id, sentenceId)).toEqual('0001-0004e');
    });
  });

  describe('this.getId', function() {
    it('adds the amount of padding to an id', function() {
      var id = '2';
      expect(idHandler.getId(id)).toEqual('0002');
    });
    it('prepends a given sentence id to the id', function() {
      var id = '2';
      var sentenceId = '1';
      expect(idHandler.getId(id, sentenceId)).toEqual('0001-0002');
    });
  });

  describe('this.assignSourceId', function() {
    it('assigns an new sourceid', function() {
      var map = new idHandler.Map();
      var added = map.add('treebank','0001',1,1);
      expect(added).toBeDefined();
    });
    it('does not reassign a sourceid', function() {
      var map = new idHandler.Map();
      var added = map.add('treebank','0001',1,1);
      expect(added).toBeDefined();
      var dupe = new idHandler.Map();
      added = dupe.add('treebank','0001',1,1);
      expect(added).not.toBeDefined();
    });
    it('clears sourceids', function() {
      var map = new idHandler.Map();
      var added = map.add('treebank','0001',1,1);
      expect(added).toBeDefined();
      map.clearSourceIdAssignments(1);
      added = map.add('treebank','0001',1,1);
      expect(added).toBeDefined();
    });
  });
});
