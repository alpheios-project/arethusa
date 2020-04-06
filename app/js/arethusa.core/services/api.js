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


    /** 
     * check ready state
     * @return {Boolean} true if arethusa is loaded and ready otherwise false
     */
    this.isReady = function () {
      return state.arethusaLoaded
    };

    /**
     * get the morphology and gloss for a specific word
     * @param {String} sentenceId sentence (chunk) identifier
     * @param {String} wordId word (token) identifier
     * @return {Object} an object adhering to a JSON representation of Alpheios Lexicon Schema wrapped in 
     *                  the BSP Morphology Service RDF Annotation Wrapper 
     *                  (i.e. the same format as parsed by the BSPMorphRetriever)
     */
    this.getMorph = function(sentenceId,wordId) {
      return this.outputter.outputMorph(state.getToken(idHandler.getId(wordId,sentenceId)),lang(),morph());
    };

    /**
     * returns subdoc of the current sentence
     * @return {String} the subdoc of the current sentence (may also be undefined or '')
     */
    this.getSubdoc = function() {
      return navigator.currentSubdocs()[0];
    };

    /** 
     * rerenders the tree
     * can be useful to call the tree is first loaded in a iframe that isn't visible
     */
    this.refreshView = function() {
      navigator.triggerRefreshEvent();
    }

    /** 
     * navigates application state to the next sentence
     */
    this.nextSentence = function() {
      navigator.nextChunk();
    };

    /**  
     * navigates application state to the previous sentence
     */
    this.prevSentence = function() {
      navigator.prevChunk();
    };

    /**  
     * navigates application state to supplied sentenceId
     * making the optional word id selected
     * @param {String} sentenceId 
     * @param {String} wordId (optional)
     */
    this.gotoSentence = function(sentenceId, wordId) {
      navigator.goTo(sentenceId);
      if (wordId) {
        var token_id  = idHandler.getId(wordId,sentenceId)
        state.multiSelect([token_id])
      }
    };

    /**
     * navigate application state to the supplied sentence and word
     * finding the word by the word string and the surrounding context
     * @param {String} sentenceId sentence (chunk) identifier
     * @param {String} word the word to find
     * @param {String[]} prefix a list of words which preceed this word in the sentence
     * @param {String[]} suffix a list of words which follow this word in the sentence
     */
    this.gotoSentenceFindWord = function(sentenceId, word, prefix, suffix) {
      navigator.goTo(sentenceId);
    }


  }
]);
