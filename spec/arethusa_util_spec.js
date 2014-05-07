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
});
