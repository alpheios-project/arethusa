"use strict";

/**
 * @ngdoc service
 * @name arethusa.util.commons
 *
 * @description
 * Provides several constructors for commonly used classes in Arethusa.
 *
 */

angular.module('arethusa.util').service('commons', [
  function ArethusaClasses() {
    // Used to define plugin settings
    function Setting(label, model, changeOrDirective) {
      this.label = label;
      this.model = model;
      if (angular.isFunction(changeOrDirective)) {
        this.change = changeOrDirective;
      } else {
        this.directive = changeOrDirective;
      }
    }


    /**
     * @ngdoc function
     * @name arethusa.util.commons#setting
     * @methodOf arethusa.util.commons
     *
     * @description
     * TODO
     *
     */
    this.setting = function(l, m, c) { return new Setting(l, m, c); };


    function Doc(xml, json, conf) {
      this.xml = xml;
      this.json = json;
      this.conf = conf;
    }

    /**
     * @ngdoc function
     * @name arethusa.util.commons#doc
     * @methodOf arethusa.util.commons
     *
     * @description
     * Returns a new Arethusa document.
     *
     * Retrievers should use this constructor for all documents they want to
     * save inside the {@link arethusa.core.documentStore documentStore}.
     *
     * Either `xml` or `json` are mandatory, but both can be present.
     *
     * @param {String} xml XML representation of a document.
     * @param {Object} json JSON represenation of a document.
     * @param {Object} conf Additional configuration files specified in the document.
     *   Should contain configuration names as keys and paths to the files as values.
     *
     */
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

    /**
     * @ngdoc function
     * @name arethusa.util.commons#doc
     * @methodOf arethusa.util.commons
     *
     * @description
     * TODO
     *
     */
    this.sentence = function(t, cite) { return new Sentence(t, cite); };

    // Used by retrievers to define constituents
    function Constituent(cl, role, id, sentenceId, parentId) { // might want to add more here
      this.class = cl;
      this.role = role;
      this.id = id;
      this.sentenceId = sentenceId;
      this.parent = parentId;

      this.isConstituent = true;
    }

    /**
     * @ngdoc function
     * @name arethusa.util.commons#constituent
     * @methodOf arethusa.util.commons
     *
     * @description
     * TODO
     *
     */
    this.constituent = function(c, r, i, sId, h) { return new Constituent(c, r, i, sId, h); };

    /**
     * @ngdoc function
     * @name arethusa.util.commons#token
     * @methodOf arethusa.util.commons
     *
     * @description
     * TODO
     *
     */
    function Token(string, sentenceId) {
      this.string = string;
      this.sentenceId = sentenceId;

      this.isToken = true;
    }

    this.token = function (s, sentenceId) { return new Token(s, sentenceId); };
  }
]);
