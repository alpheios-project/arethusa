'use strict';
angular.module('arethusa.core').service('notifier', function () {
  var self = this;
  this.messages = [];

  function Message(type, message, description) {
    this.type = type;
    this.message = message;
    this.description = description;
  }

  this.success = function (message) {
    self.messages.unshift({
      type: 'success',
      message: message
    });
  };
  this.error = function (message) {
    self.messages.unshift({
      type: 'error',
      message: message
    });
  };
  this.lastMessage = function () {
    return self.messages[0];
  };
  this.oldMessages = function () {
    return self.messages.slice(1);
  };
});
