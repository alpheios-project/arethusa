'use strict';
angular.module('arethusa.core').service('keyCapture', [
  'configurator',
  '$rootScope',
  function(configurator, $rootScope) {
    var self = this;

    this.grKeyTable = configurator.configurationFor('keyCapture').grKeys;

    this.conf = function(name) {
      var c = configurator.configurationFor('keyCapture') || {};
      return c[name] || {};
    };

    var keyCodes = {
      return: 13,
      shift: 16,
      ctrl: 17,
      alt: 18,
      esc: 27
    };

    // a-z codes
    for (var i = 97; i < 123; i++){
      keyCodes[String.fromCharCode(i)] = i - 32;
    }

    this.shiftModifier = 1000;
    this.ctrlModifier  = 2000;
    this.altModifier   = 4000;
    this.metaModifier  = 8000;

    this.getKeyCode = function(key) {
      var parsed = parseKey(key);
      var modifiers = parsed[0];
      var k = parsed[1];
      angular.forEach(modifiers, function(modifier, i) {
        var mod;
        switch (modifier) {
          case 'ctrl':  mod = self.ctrlModifier;  break;
          case 'shift': mod = self.shiftModifier; break;
          case 'alt':   mod = self.altModifier;   break;
          case 'meta':  mod = self.altModifier;   break;
        }
        k = k + mod;
      });

      return k;
    };

    function parseKey(key) {
      var parts = key.split('-');
      var k = parts.pop();
      if (k.match(/[A-Z]/)) {
        // in case someone wants to do shift-J
        if (! arethusaUtil.isIncluded(parts, 'shift')) {
          parts.push('shift');
        }
        k = k.toLowerCase();
      }

      return [parts, keyCodes[k]];
    }

    this.getGreekKey = function(event) {
      var res;
      angular.forEach(keyCodes, function(code, key) {
        if (code == event.keyCode) {
          res = self.grKeyTable[key];
        }
      });
      return res;
    };

    var keyPressedCallbacks = {};

    function modifiedKeyCode(event) {
      var k = event.keyCode;

      if (event.shiftKey) k = k + self.shiftModifier;
      if (event.ctrlKey)  k = k + self.ctrlModifier;
      if (event.altKey)   k = k + self.altModifier;
      if (event.metaKey)  k = k + self.metaModifier;

      return k;
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
    var repeater = '';

    this.keyup = function (event) {
      if (arethusaUtil.isIncluded(forbiddenTags, event.target.tagName)) {
        return;
      }
      if (isRepeater(event.keyCode)) {
        var rep = event.keyCode - 48;
        repeater = repeater + rep;
        return;
      }
      var keyCode = modifiedKeyCode(event);
      handleCallbacks(event);
      resetRepeater();
    };

    this.doRepeated = function(fn) {
      var rep = parseInt(repeater, 10) || 1; // default value (and beware octals!)
      for (; rep > 0; rep--) {
        fn();
      }
    };

    function isRepeater(code) {
      if (! isNaN(code)) {
        var numeric = parseInt(code) - 48;
        return numeric > -1 && numeric < 10;
      }
    }

    function resetRepeater() {
      repeater = '';
    }

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

    // deprecated - use initCaptures instead
    this.registerCaptures = function(captures, scope) {
      scope = scope ? scope : $rootScope;
      angular.forEach(captures, function(fn, key) {
        if (angular.isDefined(key)) {
          self.onKeyPressed(key, function() {
            scope.$apply(fn);
          });
        }
      });
    };

    function Capture(confKey, fn, defaultKey) {
      this.confKey = confKey;
      this.fn = fn;
      this.defaultKey = defaultKey;
    }

    this.create = function(confKey, fn, defaultKey) {
      return new Capture(confKey, fn, defaultKey);
    };

    this.initCaptures = function(callback) {
      angular.forEach(callback(self), function(captures, section) {
        var conf = self.conf(section);
        angular.forEach(captures, function(capture, i) {
          var key = conf[capture.confKey] || capture.defaultKey;
          if (angular.isDefined(key)) {
            self.onKeyPressed(key, function() {
              $rootScope.$apply(capture.fn);
            });
          }
        });
      });
    };
  }
]);
