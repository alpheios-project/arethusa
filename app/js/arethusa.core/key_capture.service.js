"use strict";

angular.module('arethusa.core').service('keyCapture', function() {
  var keyCodes = {
    shift: 16,
    ctrl: 17,
    alt: 18
  };

  var activeModifiers = {
    16: false,
    17: false,
    18: false
  };

  this.keydown = function (event) {
    if (event.keyCode in activeModifiers) {
      activeModifiers[event.keyCode] = true;
    }
  };

  this.keyup = function (event) {
    if (event.keyCode in activeModifiers) {
      activeModifiers[event.keyCode] = false;
    }
  };

  this.isCtrlActive = function () {
    return activeModifiers[keyCodes.ctrl];
  };
});
