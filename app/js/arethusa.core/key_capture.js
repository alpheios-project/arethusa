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

  this.keyPressedCallbacks = {};

  this.keydown = function (event) {
    if (event.keyCode in activeKeys) {
      activeKeys[event.keyCode] = true;
    }
  };
  this.keyup = function (event) {
    if (event.keyCode in activeKeys) {
      if (activeKeys[event.keyCode] && this.keyPressedCallbacks[event.keyCode]) {
        var callback = this.keyPressedCallbacks[event.keyCode];
        callback();
      }
      activeKeys[event.keyCode] = false;
    }
  };
  this.isCtrlActive = function () {
    return activeKeys[this.keyCodes.ctrl];
  };

  this.onKeyPressed = function(keyCode, callback) {
    this.keyPressedCallbacks[keyCode] = callback;
  };
});
