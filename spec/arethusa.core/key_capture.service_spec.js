"use strict";

describe('keyCapture', function() {
  beforeEach(module('arethusa.core'));

  describe('isCtrlActive', function() {
    it('return false before any event', inject(function(keyCapture) {
      expect(keyCapture.isCtrlActive()).toBe(false);
    }));

    it('return true if keydown for ctrl was received', inject(function(keyCapture) {
      keyCapture.keydown({ keyCode : keyCapture.keyCodes.ctrl });

      expect(keyCapture.isCtrlActive()).toBe(true);
    }));

    it('return false if keydown for ctrl was received', inject(function(keyCapture) {
      keyCapture.keydown({ keyCode : keyCapture.keyCodes.ctrl });
      keyCapture.keyup({ keyCode : keyCapture.keyCodes.ctrl });

      expect(keyCapture.isCtrlActive()).toBe(false);
    }));
  });
});
