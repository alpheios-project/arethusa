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
    }

    this.success = function (message) {
      self.addMessage('success', message);
    };
    this.error = function (message) {
      self.addMessage('error', message);
    };

    this.lastMessage = function () {
      self.current = self.messages[0];
      return self.current;
    };
    this.oldMessages = function () {
      return self.messages.slice(1);
    };

    this.addMessage = function(type, message) {
      if (self.messages.length === self.maxMessages) {
        self.messages.pop();
      }
      self.messages.unshift(new Message(type, message));
      self.lastMessage();
    };

    this.init = function() {
      configure();
      self.messages = [];
    };
  }
]);
