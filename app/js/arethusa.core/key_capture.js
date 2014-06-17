'use strict';
angular.module('arethusa.core').service('keyCapture', function () {
  this.keyCodes = {
    shift: 16,
    ctrl: 17,
    alt: 18,
    esc: 27
  };

  var activeKeys = {
      16: false,
      17: false,
      18: false,
      27: false
  };

  var keyPressedCallbacks = {};

  var handleCallbacks = function(keyCode) {
    if (activeKeys[keyCode] && keyPressedCallbacks[keyCode]) {
      var callback = keyPressedCallbacks[keyCode];
      callback();
    }
  };

  this.keydown = function (event) {
    if (event.keyCode in activeKeys) {
      activeKeys[event.keyCode] = true;
    }
  };

  this.keyup = function (event) {
    if (event.keyCode in activeKeys) {
      handleCallbacks(event.keyCode);
      activeKeys[event.keyCode] = false;
    }
  };

  this.isCtrlActive = function () {
    return activeKeys[this.keyCodes.ctrl];
  };

  this.onKeyPressed = function(keyCode, callback) {
    keyPressedCallbacks[keyCode] = callback;
  };
});
