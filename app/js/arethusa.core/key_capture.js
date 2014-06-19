'use strict';
angular.module('arethusa.core').service('keyCapture', [
  'configurator',
  function(configurator) {
    var self = this;

    this.conf = function() {
      return configurator.configurationFor('keyCapture');
    };

    this.keyCodes = {
      shift: 16,
      ctrl: 17,
      alt: 18,
      esc: 27,
      j: 74,
      k: 75,
      w: 87,
      e: 69
    };

    var activeKeys = {};
    angular.forEach(this.keyCodes, function (value, key) {
      activeKeys[value] = false;
    });

    var keyPressedCallbacks = {};

    var handleCallbacks = function(keyCode) {
      if (activeKeys[keyCode] && keyPressedCallbacks[keyCode]) {
        var callbacks = keyPressedCallbacks[keyCode];
        resolveCallbacks(callbacks);
        resumePropagation();
      }
    };

    this.keydown = function (event) {
      if (event.keyCode in activeKeys) {
        activeKeys[event.keyCode] = true;
      }
    };

    var forbiddenTags = ['INPUT'];

    this.keyup = function (event) {
      if (arethusaUtil.isIncluded(forbiddenTags, event.target.tagName)) {
        return;
      }

      if (event.keyCode in activeKeys) {
        handleCallbacks(event.keyCode);
        activeKeys[event.keyCode] = false;
      }
    };

    this.isCtrlActive = function () {
      return activeKeys[this.keyCodes.ctrl];
    };

    function Callback(callback, priority) {
      this.callback = callback;
      this.priority = priority || 0;
    }

    this.onKeyPressed = function(keyCode, callback, priority) {
      var callbacks = keyPressedCallbacks[keyCode] || [];
      callbacks.push(new Callback(callback, priority));
      keyPressedCallbacks[keyCode] = sortedByPriority(callbacks);
    };

    function sortedByPriority(callbacks) {
      return callbacks.sort(function(a, b) {
        return b.priority - a.priority;
      });
    }

    var propagationStopped = false;

    this.stopPropagation = function() {
      propagationStopped = true;
    };

    function resumePropagation() {
      propagationStopped = false;
    }

    function resolveCallbacks(callbacks) {
      angular.forEach(callbacks, function(callbackObj, key) {
        if (! propagationStopped) {
          callbackObj.callback();
        }
      });
    }
  }
]);
