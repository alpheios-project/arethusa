"use strict";

// This should rather be a factory, that returns a constructor -
// and the constructor takes customized idGenerator functions.
// TODO: Like the generateID function in the TreeBankRetriever?

/**
 * This service provides functionality to retrievers that covers mapping between external and internal IDs,
 * and announcing pre-selections to the state.
 */
angular.module('arethusa').service('retrieverHelper', [
  'idHandler',
  'locator',
  function(idHandler, locator) {

      /**
       * This adds a mapping to the idHandler and extends the stateToken with it
       * @param stateToken token located in the state
       * @param internalId local token ID (usually sentence index plus word index internal to a chunk)
       * @param sourceId token ID in the containing document
       * @param docId ID for the containing document
       */
    this.generateId = function(stateToken, internalId, sourceId, docId) {
      var idMap = new idHandler.Map();
      idMap.add(docId, internalId, sourceId, stateToken.sentenceId);
      stateToken.id = internalId;
      stateToken.idMap = idMap;
    };

    // Currently disfunct - needs sentence id to work again
    // Preselections = selection specified in config, to be declared to state
    /**
     * This gets and formats pre-selection IDs for declaration to the state during init
     * @param conf configuration for retriever
     * @returns {*} state ids for pre-selections
       */
    this.getPreselections = function(conf) {
      var preselections = aU.toAry(locator.get(conf.preselector));
      return arethusaUtil.map(preselections, function(id) {
        return idHandler.getId(id);
      });
    };
  }
]);
