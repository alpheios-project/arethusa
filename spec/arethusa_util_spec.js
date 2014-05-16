"use strict";

describe("arethusaUtil", function() {
  var aU = arethusaUtil;

  describe("formatNumber", function() {
    describe('pads a number with zeros', function() {
      it('where number is a string', function() {
        expect(aU.formatNumber('1', 3)).toEqual('001');
      });

      it('where number is an integer', function() {
        expect(aU.formatNumber(1, 4)).toEqual('0001');
      });
    });
  });

  describe('map', function() {
    it('iterates over an array and applies a given function I', function() {
      var coll = [1, 2, 3];
      var fn = function(el) {
        return el + 1;
      };
      var result = [2, 3, 4];
      expect(aU.map(coll, fn)).toEqual(result);
    });

    it('iterates over an array and applies a given function II', function() {
      var coll = ['a', 'b', 'c'];
      var obj = { a: 1, b: 2, c: 3};
      var fn = function(el) {
        return obj[el];
      };
      var result = [1, 2, 3];
      expect(aU.map(coll, fn)).toEqual(result);
    });
  });

  describe('inject', function() {
    it('works like a ruby each_with_object', function() {
      var coll = [1, 2, 3];
      var fn = function(memo, el) {
        memo.push(el + 1);
      };
      var res = [2, 3, 4];
      expect(aU.inject([], coll, fn)).toEqual(res);
    });

    it("will not work with immutable objects", function() {
      var coll = [1, 2, 3];
      var fn = function(memo, el) {
        memo += el;
      };
      expect(aU.inject(0, coll, fn)).toEqual(0);
      expect(aU.inject(0, coll, fn)).not.toEqual(6);
    });

    it('works with object as collection too', function() {
      var coll = { a: 1, b: 2};
      var fn = function(memo, key, value) {
        memo.push(value);
        memo.push(key);
      };
      var res = [1, 'a', 2, 'b'];
      expect(aU.inject([], coll, fn)).toEqual(res);
    });
  });

  describe('pushAll', function() {
    it('flat-pushes all elements of an array into another', function() {
      var arr1 = [1, 2];
      var arr2 = [3, 4];
      var res  = [1, 2, 3, 4];
      aU.pushAll(arr1, arr2);
      expect(arr1).toEqual(res);
    });

    it('handles empty arrays as pushers as well', function() {
      var arr1 = [1,2];
      var arr2 = [];
      var res  = [1, 2];
      aU.pushAll(arr1, arr2);
      expect(arr1).toEqual(res);
    });
  });

  describe('findObj', function(){
    it('finds an object based on an assumtion given in a function', function() {
      var val = '1';
      var obj1 = { prop: '1'};
      var obj2 = { prop: '2'};
      var coll = { a: obj1, b: obj2 };
      var fn = function(el) {
        return el.prop === val;
      };
      expect(aU.findObj(coll, fn)).toEqual(obj1);
    });
  });

  describe('toAry', function() {
    it('wraps an object in an array', function() {
      expect(aU.toAry({})).toEqual([{}]);
    });

    it("doesn't wrap it if the obj is already an array", function() {
      expect(aU.toAry([{}])).toEqual([{}]);
    });
  });

  describe('replaceAt', function() {
    it('replaces a char in a string at an index', function() {
      expect(aU.replaceAt('abc', 1, 'B')).toEqual('aBc');
    });
  });
});
