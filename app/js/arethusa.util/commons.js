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
    function Sentence(id, tokens, constituents, cite) {
      var self = this;

      this.id = id;
      this.tokens = tokens;
      this.constituents = constituents;
      this.cite = cite || '';

      this.toString = function() {
        return arethusaUtil.inject([], self.tokens, function(memo, id, token) {
          memo.push(token.string);
        }).join(' ');
      };
    }

    this.sentence = function(i, t, c, cite) { return new Sentence(i, t, c, cite); };
    // Used by retrievers to define constituents
    function Constituent(cl, role, id, head) { // might want to add more here
      this.class = cl;
      this.role = role;
      this.id = id;
      this.head = head;
    }

    this.constituent = function(c, r, i, h) { return new Constituent(c, r, i, h); };

    // A simple token container
    function Token(string, sentenceId) {
      this.string = string;
      this.sentenceId = sentenceId;
    }

    this.token = function (s, sentenceId) { return new Token(s, sentenceId); };
  }
]);
