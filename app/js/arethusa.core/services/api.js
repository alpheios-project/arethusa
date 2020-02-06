"use strict";

angular.module('arethusa.core').service('api', [
  'state',
  'idHandler',
  function(state,idHandler) {
    var self = this;

    this.getMorph = function(sentenceId,wordId) {
      if (!state.arethusaLoaded) {
        console.error("Api called before Arethusa was loaded")
      }
      return state.getToken(idHandler.getId(wordId,sentenceId));
    };

  }
]);
