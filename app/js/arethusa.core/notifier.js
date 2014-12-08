'use strict';
angular.module('arethusa.core').service('notifier', [
  'configurator',
  'toaster',
  '$timeout',
  function(configurator, toaster, $timeout) {
    var self = this;

    function configure() {
      self.conf = configurator.configurationFor('notifier');
      self.disable = self.conf.disable;
      self.duration = self.conf.duration || 10000;
      self.maxMessages = self.conf.maxMessages || 15;
    }

    this.messages = [];

    function Message(type, message, title) {
      this.type = type;
      this.message = message;
      this.title = title;
      this.time = new Date();
    }

    function generate(type) {
      self[type] = function(message, title, debounce) {
        if (!self.disable) {
          self.addMessage(type, message, title, debounce);
        }
      };
    }

    var debouncer = {};

    var types = ['success', 'info', 'wait', 'warning', 'error'];
    angular.forEach(types, generate);

    function messageKey(type, message, title) {
      return [type, message, title].join('||');
    }

    function messageAlreadyAdded(msgKey) {
      return debouncer[msgKey];
    }

    function cancelTimer(msgKey) {
      return function() {
        $timeout.cancel(debouncer[msgKey]);
      };
    }

    function addDebouncing(msgKey, duration) {
      debouncer[msgKey] = $timeout(cancelTimer, duration, false);
    }

    this.addMessage = function(type, message, title, debounce) {
      if (self.messages.length === self.maxMessages) {
        self.messages.pop();
      }

      var msgKey = messageKey(type, message, title);
      if (debounce) {
        if (messageAlreadyAdded(type, message, title)) {
          return;
        } else {
          addDebouncing(msgKey, debounce);
        }
      }
      var msg = new Message(type, message, title);
      self.messages.unshift(msg);
      toaster.pop(type, title, message);
    };

    this.toggle = function() {
      self.panelActive = !self.panelActive;
    };

    this.init = function() {
      configure();
    };
  }
]);
