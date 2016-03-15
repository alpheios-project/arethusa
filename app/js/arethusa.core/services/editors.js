"use strict";

angular.module('arethusa.core').service('editors', [
  'User',
  function(User) {
    var self = this;

    this.perDocument = {};

    this.addEditor = function(docId, editor) {
      var doc = self.perDocument[docId];
      if (!doc) doc = self.perDocument[docId] = [];
      doc.push(new User(editor));
      self.editorsPresent = true;
    };

    this.editorsPresent = false;
  }
]);
