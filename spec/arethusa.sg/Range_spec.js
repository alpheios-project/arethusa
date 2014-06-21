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
});
