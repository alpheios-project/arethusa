"use strict";

describe('keyCapture', function() {
  beforeEach(module('arethusa.core'));

  describe('onKeyPressed', function() {
    it('calls the given callback', inject(function(keyCapture) {
      var event = {
        keyCode: 27,
        target: { tagname: '' }
      };
      var callbackCalled = false;
      var callback = function() { callbackCalled = true; };
      keyCapture.onKeyPressed('esc', callback);

      keyCapture.keyup(event);

      expect(callbackCalled).toBe(true);
    }));
  });
});
