'use strict';
angular.module('arethusa.core').service('keyCapture', [
  'configurator',
  function(configurator) {
    var self = this;

    this.conf = function() {
      return configurator.configurationFor('keyCapture');
    };

    var keyCodes = {
      shift: 16,
      ctrl: 17,
      alt: 18,
      esc: 27,
      j: 74,
      k: 75,
      w: 87,
      e: 69
    };

    this.shiftModifier = 1000;

    this.getKeyCode = function(key) {
      var keyCode = keyCodes[key.toLowerCase()];
      if (key.match(/[A-Z]/)) {
        return keyCode + self.shiftModifier;
      }
      return keyCode;
    };

    var keyPressedCallbacks = {};

    function modifiedKeyCode(event) {
      var keyCode = event.keyCode;
      if (event.shiftKey) {
        keyCode = keyCode + self.shiftModifier;
      }
      return keyCode;
    }

    var handleCallbacks = function(event) {
      var keyCode = modifiedKeyCode(event);
      var callbacks = keyPressedCallbacks[keyCode];
      if (callbacks) {
        resolveCallbacks(callbacks, event);
        resumePropagation();
      }
    };

    this.keydown = function (event) {
      // we're only acting on keyup for now
    };

    var forbiddenTags = ['INPUT'];

    this.keyup = function (event) {
      if (arethusaUtil.isIncluded(forbiddenTags, event.target.tagName)) {
        return;
      }
      var keyCode = modifiedKeyCode(event);
      handleCallbacks(event);
    };

    function Callback(callback, priority) {
      this.callback = callback;
      this.priority = priority || 0;
    }

    this.onKeyPressed = function(key, callback, priority) {
      var keyCode = self.getKeyCode(key);
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

    function resolveCallbacks(callbacks, event) {
      angular.forEach(callbacks, function(callbackObj, key) {
        if (! propagationStopped) {
          callbackObj.callback(event);
        }
      });
    }
  }
]);
