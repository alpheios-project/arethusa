"use strict";

angular.module('arethusa').service('retrieverHelper', [
  'idHandler',
  function(idHandler) {
    this.generateId = function(stateToken, internalId, sourceId, docId) {
      var idMap = new idHandler.Map();
      idMap.add(docId, internalId, sourceId);
      stateToken.id = internalId;
      stateToken.idMap = idMap;
    };
  }
]);
