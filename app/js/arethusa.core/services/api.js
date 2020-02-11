"use strict";

angular.module('arethusa.core').service('api', [
  'state',
  'idHandler',
  'apiOutputter',
  'documentStore',
  'plugins',
  'uuid2',
  function(state,idHandler,apiOutputter,documentStore,plugins,uuid2) {
    var self = this;
    this.outputter = new apiOutputter(uuid2);


    var lazyMorph;
    function morph() {
      if (!lazyMorph) lazyMorph = plugins.get('morph');
      return lazyMorph;
    }

    var lazyLang;
    function lang() {
      if (!lazyLang) {
        var document = documentStore.store['treebank'];
        if ( document !== undefined ) {
          var doc = document.json.treebank || document.json.book;
          if (doc) {
            lazyLang = doc["_xml:lang"];
          }
        }
      }
      return lazyLang;
    }

    this.getMorph = function(sentenceId,wordId) {
      if (!state.arethusaLoaded) {
        console.error("Api called before Arethusa was loaded")
      }
      return this.outputter.outputMorph(state.getToken(idHandler.getId(wordId,sentenceId)),lang(),morph());
    };

  }
]);
