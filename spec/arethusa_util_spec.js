"use strict";

/* global arethusaUtil */
describe("arethusaUtil", function() {
  describe("formatNumber", function() {
    describe('pads a number with zeros', function() {
      it('where number is a string', function() {
        expect(arethusaUtil.formatNumber('1', 3)).toEqual('001');
      });

      it('where number is an integer', function() {
        expect(arethusaUtil.formatNumber(1, 4)).toEqual('0001');
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
      expect(arethusaUtil.map(coll, fn)).toEqual(result);
    });

    it('iterates over an array and applies a given function II', function() {
      var coll = ['a', 'b', 'c'];
      var obj = { a: 1, b: 2, c: 3};
      var fn = function(el) {
        return obj[el];
      };
      var result = [1, 2, 3];
      expect(arethusaUtil.map(coll, fn)).toEqual(result);
    });
  });

  describe('pushAll', function() {
    it('flat-pushes all elements of an array into another', function() {
      var arr1 = [1, 2];
      var arr2 = [3, 4];
      var res  = [1, 2, 3, 4];
      arethusaUtil.pushAll(arr1, arr2);
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
      expect(arethusaUtil.findObj(coll, fn)).toEqual(obj1);
    });
  });
});
