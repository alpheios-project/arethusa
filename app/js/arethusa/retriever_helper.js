"use strict";

// This should rather be a factory, that returns a constructor -
// and the constructor takes customized idGenerator functions.

angular.module('arethusa').service('retrieverHelper', [
  'idHandler',
  'locator',
  function(idHandler, locator) {
    this.generateId = function(stateToken, internalId, sourceId, docId) {
      var idMap = new idHandler.Map();
      idMap.add(docId, internalId, sourceId, stateToken.sentenceId);
      stateToken.id = internalId;
      stateToken.idMap = idMap;
    };

    // Currently disfunct - needs sentence id to work again
    this.getPreselections = function(conf) {
      var preselections = aU.toAry(locator.get(conf.preselector));
      return arethusaUtil.map(preselections, function(id) {
        return idHandler.getId(id);
      });
    };
  }
]);
