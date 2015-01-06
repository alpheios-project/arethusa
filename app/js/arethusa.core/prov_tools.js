"use strict";

angular.module('arethusa.core').service('provTools', [
  'Tool',
  function(Tool) {
    var self = this;

    this.perDocument = {};

    this.addTool = function(docId, tool) {
      var doc = self.perDocument[docId];
      if (!doc) doc = self.perDocument[docId] = [];
      doc.push(new Tool(tool));
      self.toolsPresent = true;
    };

    this.toolsPresent = false;
  }
]);
