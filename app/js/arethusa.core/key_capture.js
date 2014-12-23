'use strict';

/**
 * @ngdoc service
 * @name arethusa.core.keyCapture
 *
 * @description
 * Service to handle Arethusa's keyboard shortcuts.
 *
 * While its API is fairly clean and comfortable to use, the implementation
 * is of very poor quality and very hard to read.
 *
 *
 * @requires arethusa.core.configurator
 * @requires $rootScope
 */
angular.module('arethusa.core').service('keyCapture', [
  'configurator',
  '$rootScope',
  function(configurator, $rootScope) {
    var self = this;

    this.conf = function(name) {
      var c = configurator.configurationFor('keyCapture') || {};
      return c[name] || {};
    };

    var keyCodes = {
      return: 13,
      shift: 16,
      ctrl: 17,
      alt: 18,
      esc: 27,
      up: 38,
      down: 40,
      '↑': 38,
      '↓': 40,
      ":" : 186,
      "[" : 219,
      "'" : 222,
      "]" : 221
    };

    // a-z codes
    for (var i = 97; i < 123; i++){
      keyCodes[String.fromCharCode(i)] = i - 32;
    }

    var codesToKeys = arethusaUtil.inject({}, keyCodes, function(memo, key, code) {
      memo[code] = key;
    });

    this.codeToKey = function(keyCode) {
      return codesToKeys[keyCode];
    };

    this.keyToCode = function(key) {
      return keyCodes[key];
    };

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
          case 'meta':  mod = self.metaModifier;   break;
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

    function modifiers(keys) {
      return Object.keys(keys.modifiers);
    }

    var lookUpKey = [];
    this.getForeignKey = function(event, language) {

      // Disallow modifier keys except for shift
      if (event.altKey || event.ctrlKey) {
        return undefined;
      }

      var res = [];
      var keys = keysFor(language);
      var key = codesToKeys[event.keyCode];
      var mod = keys.modifiers;
      if (key) {
        // We don't want to match 'shift' as a key, so
        // we return if it's the case.
        if (key == 'shift') {
          return;
        }
        if (event.shiftKey) {
          res.push('shift');
        }
        if (arethusaUtil.isIncluded(modifiers(keys), key)) {
          res.push(key);
          var joined = res.join('-');
          lookUpKey.push(joined);
          return false;
        } else {
          if (arethusaUtil.isIncluded(res, 'shift')) {
            // Following lines provide that 'shift-a'
            // and 'A' is the same.
            var i = res.indexOf("shift");
            res.splice(i, 1);
            key = key.toUpperCase();
          }
          res.push(key);
        }
      }

      var lookUp = lookUpKey.concat(res);
      var sortedLookUp = sortLookUp(lookUp, mod);
      var foreignKey = keys[sortedLookUp.join('-')];
      lookUpKey = [];
      return foreignKey;
    };

    function sortLookUp(lookUp, modifiers) {
      var lastItem = lookUp.length - 1;
      var letter = lookUp[lastItem];
      var mod = lookUp.slice(0, lastItem);
      mod.sort(function(a,b) {
        return modifiers[a]-modifiers[b];
      });
      return mod.concat(letter);
    }

    function keysFor(language) {
      var keys = (self.conf('keys') || {})[language];
      return keys || {};
    }

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

    function broadcastKey(key) {
      $rootScope.$broadcast('keyCaptureLaunched', keyList[key] || key);
    }

    var forbiddenTags = ['INPUT', 'TEXTAREA'];
    this.keydown = function (event) {
      if (arethusaUtil.isIncluded(forbiddenTags, event.target.tagName) ||
          isRepeater(event.keyCode)) {
        return;
      }

      var keyCode = modifiedKeyCode(event);
      if (keyPressedCallbacks[keyCode]) {
        broadcastKey(keyCode);
      }
    };

    var repeater = '';

    this.keyup = function (event) {
      if (arethusaUtil.isIncluded(forbiddenTags, event.target.tagName)) {
        return;
      }
      if (isRepeater(event.keyCode)) {
        var rep = event.keyCode - 48;
        // A number needs to be broadcasted here, as it doesn't have a keydown
        // event at all.
        broadcastKey(rep);
        repeater = repeater + rep;
        return;
      }
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

    // The keyList is just a dictionary of string representations
    // of the keyCode we use internally.
    var keyList = {};
    function addToKeyList(code, key) {
      keyList[code] = key;
    }

    /**
     * @ngdoc function
     * @name arethusa.core.keyCapture#onKeyPressed
     * @methodOf arethusa.core.keyCapture
     *
     * @description
     * TODO
     */
    this.onKeyPressed = function(key, callback, priority) {
      var keyCode = self.getKeyCode(key);
      addToKeyList(keyCode, key);
      var callbacks = keyPressedCallbacks[keyCode] || [];
      var cb = new Callback(callback, priority);
      callbacks.push(cb);
      keyPressedCallbacks[keyCode] = sortedByPriority(callbacks);
      return function() { removeElement(keyPressedCallbacks[keyCode], cb); };
    };

    function sortedByPriority(callbacks) {
      return callbacks.sort(function(a, b) {
        return b.priority - a.priority;
      });
    }

    var propagationStopped = false;

    /**
     * @ngdoc function
     * @name arethusa.core.keyCapture#stopPropagation
     * @methodOf arethusa.core.keyCapture
     *
     * @description
     * TODO
     */
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

    function Capture(confKey, fn, defaultKey) {
      this.confKey = confKey;
      this.fn = fn;
      this.defaultKey = defaultKey;
    }

    this.create = function(confKey, fn, defaultKey) {
      return new Capture(confKey, fn, defaultKey);
    };

    function addToKeys(keys, sec, name, key) {
      if (!keys[sec]) keys[sec] = {};
      keys[sec][name] = key;
    }

    function addToKeyLists(keys) {
      var destructors = [];
      angular.extend(self.activeKeys, keys);
      angular.forEach(keys, function(captures, section) {
        angular.forEach(captures, function(key, capture) {
          var keysDefined = self.keyList[key];
          if (!keysDefined) keysDefined = self.keyList[key] = [];
          var listKey = section + '.' + capture;
          keysDefined.push(listKey);
          destructors.push(function() {
            // only remove when these elements haven't been redefined by someone
            // else
            var sec = self.activeKeys[section] || {};
            var k   = sec[capture];
            if (key === k) delete sec[capture];
            removeElement(keysDefined, listKey);
          });
        });
      });

      return destructorFn(destructors);
    }

    function destructorFn(arr) {
      return function() {
        for (var i = arr.length - 1; i >= 0; i--) { arr[i](); }
      };
    }

    function removeElement(arr, el) {
      var i = arr.indexOf(el);
      arr.splice(i, 1);
    }

    /**
     * @ngdoc function
     * @name arethusa.core.keyCapture#initCaptures
     * @methodOf arethusa.core.keyCapture
     *
     * @description
     * TODO
     */
    this.initCaptures = function(callback) {
      var destructors = [];
      var keys = arethusaUtil.inject({}, callback(self), function(memo, section, captures) {
        var conf = self.conf(section);
        angular.forEach(captures, function(capture, i) {
          var key = conf[capture.confKey] || capture.defaultKey;
          if (angular.isDefined(key)) {
            addToKeys(memo, section, capture.confKey, key);
            var destructor = self.onKeyPressed(key, function() {
              $rootScope.$apply(capture.fn);
            });
            destructors.push(destructor);
          }
        });
      });

      if (!angular.equals({}, keys)) {
        $rootScope.$broadcast('keysAdded', keys);
        destructors.push(addToKeyLists(keys));
      }
      keys.$destroy = destructorFn(destructors);
      return keys;
    };

    // Help
    function usKeyboardLayout() {
      var layout = self.conf("keys");
      return layout.us;
    }

    function setStyle(kKey, cas) {
      // 0 and 1 as properties of kKey.style.class may seem cryptic:
      // ng-repeat in the foreign-keys-help-template iterates
      // over the kKey.show array and provides class names with the
      // $index value. The first element is always the lower case
      // char, the second one the upper case char. This function
      // handles cases, where we want to set either the lower
      // case or the upper case key inactive.

      var style = kKey.style;
      var number = { "lower" : "0", "upper" : "1"};
      style.class = style.class || {};
      if (kKey.hide === undefined) {
        style.class[number[cas]] = "inactive";
      }
    }

    function pushKeys(fKeys, kKey, cas) {
      var display = kKey.show;
      var typeCase = kKey[cas];
      if (!typeCase) return;

      if (fKeys[typeCase]) {
        display.push(fKeys[typeCase]);
      } else {
        setStyle(kKey, cas);
        display.push(typeCase);
      }
    }

    this.mappedKeyboard = function(language, shifted) {
      var fKeys = keysFor(language);
      var keyboardKeys = usKeyboardLayout();
      var res = [];
      var modes = ['lower', 'upper'];
      modes = shifted ? modes.reverse() : modes;
      angular.forEach(keyboardKeys, function(kKey, i) {
        kKey.show = [];
        angular.forEach(modes, function(mode, i) {
          pushKeys(fKeys, kKey, mode);
        });
        res.push(kKey);
      });
      return res;
    };

    /**
     * @ngdoc property
     * @name activeKeys
     * @propertyOf arethusa.core.keyCapture
     *
     * @description
     * TODO
     */
    this.activeKeys = {};

    /**
     * @ngdoc property
     * @name keyList
     * @propertyOf arethusa.core.keyCapture
     *
     * @description
     * TODO
     */
    this.keyList = {};
  }
]);