"use strict";

// Provides several classes frequently used in Arethusa

angular.module('arethusa.util').service('commons', [
  function ArethusaClasses() {
    // Used to define plugin settings
    function Setting(label, model, change) {
      this.label = label;
      this.model = model;
      this.change = change;
    }

    this.setting = function(l, m, c) { return new Setting(l, m, c); };


    // Used by retrievers to place documents in the document store
    function Doc(xml, json, conf) {
      this.xml = xml;
      this.json = json;
      this.conf = conf;
    }

    this.doc = function(x, j, c) { return new Doc(x, j, c); };

    // Used by retrievers to define sentences
    function Sentence(tokens, cite) {
      var self = this;

      this.tokens = tokens;
      this.cite = cite || '';

      this.toString = function() {
        return arethusaUtil.inject([], self.tokens, function(memo, id, token) {
          memo.push(token.string);
        }).join(' ');
      };
    }

    this.sentence = function(t, cite) { return new Sentence(t, cite); };

    // Used by retrievers to define constituents
    function Constituent(cl, role, id, sentenceId, parentId) { // might want to add more here
      this.class = cl;
      this.role = role;
      this.id = id;
      this.sentenceId = sentenceId;
      this.parent = parentId;

      // To make a constituent conform to a token, we also save the parentId
      // at the exact same spot as a token would do.
      this.constituency = {};
      this.constituency.id = parentId;

      this.isConstituent = true;
    }

    this.constituent = function(c, r, i, sId, h) { return new Constituent(c, r, i, sId, h); };

    // A simple token container
    function Token(string, sentenceId) {
      this.string = string;
      this.sentenceId = sentenceId;

      this.isToken = true;
    }

    this.token = function (s, sentenceId) { return new Token(s, sentenceId); };
  }
]);
