'use strict';
angular.module('arethusa.core').service('notifier', [
  'configurator',
  function(configurator) {
    var self = this;

    function configure() {
      self.conf = configurator.configurationFor('notifier');
      self.duration = self.conf.duration || 10000;
      self.maxMessages = self.conf.maxMessages || 15;
    }

    configure();
    this.messages = [];
    this.current = {};

    function Message(type, message, description) {
      this.type = type;
      this.message = message;
      this.description = description;
      this.time = new Date();
    }

    function lastMessage() {
      self.current = self.messages[0];
      return self.current;
    }

    this.success = function (message, description) {
      self.addMessage('success', message, description);
    };
    this.error = function (message, description) {
      self.addMessage('error', message, description);
    };

    this.addMessage = function(type, message, description) {
      if (self.messages.length === self.maxMessages) {
        self.messages.pop();
      }
      self.messages.unshift(new Message(type, message, description));
      lastMessage();
    };

    this.init = function() {
      configure();
      self.messages = [];
    };
  }
]);
