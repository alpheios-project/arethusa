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

      it('trims leading zeros if needed', function() {
        expect(aU.formatNumber('0001', 0)).toEqual('1');
      });

      it('returns the input when it is not a number', function() {
        expect(aU.formatNumber('', 4)).toEqual('');
        expect(aU.formatNumber('text', 4)).toEqual('text');
      });

      it('handles zeros correctly', function() {
        expect(aU.formatNumber('0', 4)).toEqual('0000');
      });

      it('can also strip away leading zeros', function() {
        expect(aU.formatNumber('01', 0)).toEqual('1');
      });

      it('does not convert them to octal numbers', function() {
        // if one isn't careful, the result of this would be 9!
        expect(aU.formatNumber('011', 0)).toEqual('11');
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

    describe('when second param is an object', function() {
      it('tries to call every iterated element as getter', function() {
        var obj = { a: 1, b: 2, c: 3};
        var res = aU.map(['a', 'b'], obj);
        expect(res).toEqual([1, 2]);
      });
    });

    describe('when second param is a string', function() {
      it('tries to use the string as getter on every element', function() {
        var arr = [{ a: 1 }, { a: 2 }];
        var res = aU.map(arr, 'a');
        expect(res).toEqual([1, 2]);
      });
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

  describe('last', function() {
    it('returns the last item in an array', function() {
      var arr = [1, 2, 3];
      expect(aU.last(arr)).toEqual(3);
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

    it('will not add to the original array if pusher is undefined', function() {
      var arr1 = [1,2];
      var res = [1,2];
      aU.pushAll(arr1, undefined);
      expect(arr1).toEqual(res);
    });

    it('returns the original array', function() {
      var arr1 = [1, 2];
      var arr2 = [3, 4];
      var res  = [1, 2, 3, 4];
      expect(aU.pushAll(arr1, arr2)).toEqual(res);
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

  describe('findNestedProperties', function() {
    it('finds object properties in an arbitrarily deep object', function() {
      var a = {
        m: 'firstM'
      };
      var b = {
        m: 'thirdM'
      };
      var y = {
        m: 'secondM',
        b: b
      };
      var obj = {
        x: {
          a: a
        },
        y: y,
        m: 'topM'
      };

      var result = {
        m: [ obj, a, y, b ]
      };

      expect(aU.findNestedProperties(obj, 'm')).toEqual(result);
    });

    it('handles multiple requested properties', function() {
      var a = {
        m: 'firstM'
      };
      var b = {
        m: 'thirdM'
      };
      var y = {
        m: 'secondM',
        b: b
      };
      var obj = {
        x: {
          a: a
        },
        y: y,
        m: 'topM'
      };

      var result = {
        m: [ obj, a, y, b ],
        y: [ obj ]
      };

      expect(aU.findNestedProperties(obj, ['m', 'y'])).toEqual(result);
    });
  });

  describe('toAry', function() {
    it('wraps an object in an array', function() {
      expect(aU.toAry({})).toEqual([{}]);
    });

    it("doesn't wrap it if the obj is already an array", function() {
      expect(aU.toAry([{}])).toEqual([{}]);
    });

    it('returns and empty array when the given param is undefined', function() {
      expect(aU.toAry(undefined)).toEqual([]);
    });
  });

  describe('replaceAt', function() {
    it('replaces a char in a string at an index', function() {
      expect(aU.replaceAt('abc', 1, 'B')).toEqual('aBc');
    });
  });

  describe('isTerminatingPunctuation', function() {
    it('detects sentence terminating punctuation characters', function() {
      expect(aU.isTerminatingPunctuation('.')).toBeTruthy();
      expect(aU.isTerminatingPunctuation(';')).toBeTruthy();
    });
  });

  describe('intersect', function() {
    it('returns the intersection of two arrays', function() {
      var arr1 = [1, 2, 3, 4];
      var arr2 = [1, 3, 5];
      var res  = [1, 3];
      expect(aU.intersect(arr1, arr2)).toEqual(res);
    });
  });

  describe('isIncluded', function() {
    it('determines if an element is included in an Array', function() {
      var arr = ['a', 'b'];
      expect(aU.isIncluded(arr, 'a')).toBeTruthy();
      expect(aU.isIncluded(arr, 'c')).toBeFalsy();
    });
  });

  describe('empty', function() {
    it('empties an array without touching its identity', function() {
      var arr = ['a', 'b'];
      aU.empty(arr);
      expect(arr).toEqual([]);
    });

    it('deletes all properties of an object', function() {
      var obj = { a: 1, b: 2};
      aU.empty(obj);
      expect(obj).toEqual({});
    });

    it('deletes properties only!', function() {
      function Test() {
        this.a = 1;
      }
      Test.prototype.fn = function() {};

      var obj = new Test();
      aU.empty(obj);
      expect(obj.fn).toBeDefined();
      expect(obj.a).toBeUndefined();
    });
  });

  describe('flatten', function() {
    it('flattens an array by removing all undefined or null values', function() {
      var arr = [1, 2, undefined, 3, null];
      var res = aU.flatten(arr);

      expect(res).toEqual([1, 2, 3]);
    });

    it('does not flatten false when it is the boolean value', function() {
      var arr = [true, true, false, true];
      var res = aU.flatten(arr);

      expect(res).toEqual(arr);
    });
  });

  describe('getProperty', function() {
    var obj = {
      a: {
        b: {
          c: 1
        }
      }
    };

    it('access a nested property through a string', function() {
      expect(aU.getProperty(obj, 'a.b.c')).toEqual(1);
    });

    it('returns undefined when undefined is encountered at any point of the chain', function() {
      expect(aU.getProperty(obj, 'a.b.d')).toBeUndefined();
      expect(aU.getProperty(obj, 'a.c.c')).toBeUndefined();
    });
  });

  describe('setProperty', function() {
    function obj() {
      return {
        a: {
          b: {
            c: 1
          }
        }
      };
    }

    it('sets a property in a nested object', function() {
      var x = obj();
      aU.setProperty(x, 'a.b.c', 2);
      expect(x.a.b.c).toEqual(2);
    });

    it('can add new nesting levels', function() {
      var x = obj();
      aU.setProperty(x, 'a.x.y', true);
      expect(x.a.x.y).toBeTruthy();
    });
  });

  describe('copySelection', function() {
    var obj = {
      a: { b: { c: 1, d: 2 } },
      x: { y: { z: 2 } }
    };

    it('copies a selection of properties, identified by getter strings', function() {
      var expected = {
        a: { b: { d: 2 } },
        x: { y: { z: 2 } }
      };
      var actual = aU.copySelection(obj, ['a.b.d', 'x.y']);
      expect(actual).toEqual(expected);
    });

    it('copied elements are really copied, not referenced', function() {
      var actual = aU.copySelection(obj, ['a.b.d', 'x.y']);
      expect(actual.x).not.toBe(obj.x);
    });
  });

  describe('resolveFn', function() {
    it('returns a function that calls resolve on a given object', function() {
      var calls = 0;
      var obj = {
        resolve: function() { calls++; }
      };
      var fn = aU.resolveFn(obj);

      fn();
      expect(calls).toEqual(1);
    });
  });

  describe('reject', function() {
    it('returns a function that calls reject on a given object', function() {
      var calls = 0;
      var obj = {
        reject: function() { calls++; }
      };
      var fn = aU.rejectFn(obj);

      fn();
      expect(calls).toEqual(1);
    });
  });

  describe('isUrl', function() {
    it('detects if a given string is an URL', function() {
      var url = "http://arethusa.latin-language-toolkit.org";
      var noUrl = '../x.json';

      expect(aU.isUrl(url)).toBeTruthy();
      expect(aU.isUrl(noUrl)).toBeFalsy();
    });
  });

  describe('capitalize', function() {
    it('capitalizes a string', function() {
      var str = 'test';
      var res = 'Test';
      expect(aU.capitalize(str)).toEqual(res);
    });
  });
});
