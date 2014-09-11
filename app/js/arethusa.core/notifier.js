'use strict';
angular.module('arethusa.core').service('notifier', [
  'configurator',
  'toaster',
  function(configurator, toaster) {
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
      self[type] = function(message, title) {
        if (!self.disable) {
          self.addMessage(type, message, title);
        }
      };
    }

    var types = ['success', 'info', 'wait', 'warning', 'error'];
    angular.forEach(types, generate);

    this.addMessage = function(type, message, title) {
      if (self.messages.length === self.maxMessages) {
        self.messages.pop();
      }

      self.messages.unshift(new Message(type, message, title));
      toaster.pop(type, title, message);
    };

    this.togglePanel = function() {
      self.panelActive = !self.panelActive;
    };

    this.init = function() {
      configure();
    };
  }
]);
