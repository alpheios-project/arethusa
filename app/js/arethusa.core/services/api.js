"use strict";

angular.module('arethusa.core').service('api', [
  'state',
  'idHandler',
  'apiOutputter',
  'documentStore',
  'navigator',
  'plugins',
  'uuid2',
  function(state,idHandler,apiOutputter,documentStore,navigator,plugins,uuid2) {
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
      /** TODO figure out how to be sure the api service is only instantiated after Arethusa is loaded **/
      if (!state.arethusaLoaded) {
        console.error("Api called before Arethusa was loaded")
      }
      return this.outputter.outputMorph(state.getToken(idHandler.getId(wordId,sentenceId)),lang(),morph());
    };

    this.refreshView = function() {
      navigator.triggerRefreshEvent();
    }

    this.nextSentence = function() {
      navigator.nextChunk();
    };

    this.prevSentence = function() {
      navigator.prevChunk();
    };

    this.gotoSentence = function(sentenceId) {
      navigator.goTo(sentenceId);
    };

  }
]);
