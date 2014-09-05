"use strict";

describe("urlParser", function() {
  var urlParser;

  beforeEach(function() {
    module("arethusa.core");
    inject(function(_urlParser_) {
      urlParser = _urlParser_;
    });

  });

  describe('takes an url and parses it', function() {
    var url1 = "http://www.test.com?x=1";

    it('returns an object with the url', function() {
      var res = urlParser(url1);
      expect(res.url).toEqual(url1);
    });

    it('returns an url with search params as url', function() {
      var obj = urlParser(url1);
      var res = { x: '1' };

      expect(obj.params).toEqual(res);
    });
  });
});
