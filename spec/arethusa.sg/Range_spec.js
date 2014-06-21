"use strict";

describe("Range", function() {
  beforeEach(module('arethusa.sg'));

  var Range;
  beforeEach(inject(function(_Range_) {
    Range = _Range_;
  }));

  it('takes a start and end parameter', function() {
    var range = new Range(1, 10);
    expect(range.start).toEqual(1);
    expect(range.end).toEqual(10);
  });

  it('can be created with one param that serves as start an end', function() {
    var range = new Range(1);
    expect(range.start).toEqual(1);
    expect(range.end).toEqual(1);
  });

  it('throws an error when end is less than start', function() {
    expect(function() {
      new Range(2, 1);
    }).toThrow(new RangeError('End (1) is less than start (2)'));
  });

  describe('includes()', function() {
    describe('checks if the integer given as param is included in the range', function() {
      it('when i is the low boundary', function() {
        var range = new Range(1, 5);
        expect(range.includes(1)).toBeTruthy();
      });

      it('when i is the high boundary', function() {
        var range = new Range(1, 5);
        expect(range.includes(5)).toBeTruthy();
      });

      it('when i is inbetween', function() {
        var range = new Range(1, 5);
        expect(range.includes(2)).toBeTruthy();
      });

      it('when i is too less', function() {
        var range = new Range(1, 5);
        expect(range.includes(0)).toBeFalsy();
      });

      it('when i is too big', function() {
        var range = new Range(1, 5);
        expect(range.includes(6)).toBeFalsy();
      });
    });
  });
});
