"use strict";

angular.module('arethusa.core').service('idHandler', [
  function() {
    var self = this;

    this.getId = function(id, sentenceId) {
      var s = sentenceId ? arethusaUtil.formatNumber(sentenceId, 4) : '';
      var w = arethusaUtil.formatNumber(id, 4);
      return s ? s + '-' + w : w;
    };

    // Backwards compatibility function for TreebankRetriever -
    // can be removed at a later stage. Check the function
    // padWithSentenceId there.
    this.padIdWithSId = function(id, sentenceId) {
      var s = aU.formatNumber(sentenceId, 4);
      return s + '-' + id;
    };

    this.formatId = function(id, format) {
      if (!id) return;

      format = format ? format : '%w';
      // in case we have an id formatted like 1-1 here
      var idParts = parseId(id);
      var wId = idParts.pop();
      var wParts = wIdParts(wId);
      var wIdNumericPart = arethusaUtil.formatNumber(wParts[1]);
      var sentenceId = arethusaUtil.formatNumber(idParts.pop(), 0);
      var res;
      res = format.replace('%w', wIdNumericPart + (wParts[2] || ''));
      if (format.indexOf('%s' > 1)) {
        res = sentenceId ? res.replace('%s', sentenceId) : res.replace('%s-', '');
      }
      return res;
    };

    function wIdParts(wId) {
      return /(\d*)(\w*)?/.exec(wId);
    }

    function IdMapping(internalId, sourceId) {
      // We don't need the internalId here strictly speaking, but who knows...
      this.internalId = internalId;
      this.sourceId   = sourceId;
    }

    this.Map = function() {
      var self = this;
      this.mappings = {};

      this.add = function(identifier, internalId, sourceId) {
        self.mappings[identifier] = new IdMapping(internalId, sourceId);
      };

      this.sourceId = function(identifier) {
        var map = self.mappings[identifier];
        if (map) return map.sourceId;
      };
    };

    function Transformation() {
      var self = this;
      this.mapped = {};
      this.unmapped = [];
      this.fullMap = {};
      this.add = function(token, identifier, idCreator) {
        var sourceId = token.idMap.sourceId(identifier);
        var internalId = token.id;
        if (sourceId) {
          self.mapped[sourceId] = token;
        } else {
          self.unmapped.push(token);
          sourceId = idCreator();
          token.idMap.add(identifier, internalId, sourceId);
        }
        self.fullMap[internalId] = sourceId;
      };
    }

    this.sourceIdMap = function(tokens, identifier) {
      return arethusaUtil.inject({}, tokens, function(memo, id, token) {
        memo[token.idMap.sourceId(identifier)] = id;
      });
    };

    this.transformToSoureIds = function(tokens, docIdentifier, idCreator) {
      var transformation = new Transformation();
      return arethusaUtil.inject(transformation, tokens, function(memo, id, token) {
        memo.add(token, docIdentifier, idCreator);
      });
    };

    var alphabet = [];
    for (var i = 97; i < 123; i++){
      alphabet.push(String.fromCharCode(i));
    }

    function letterInFront(letter) {
      var i = alphabet.indexOf(letter) - 1;
      return alphabet[i];
    }

    function letterAfter(letter) {
      var i = alphabet.indexOf(letter) + 1;
      return alphabet[i];
    }

    this.isExtendedId = function(id) {
      return id.match(/.*[a-z]$/);
    };

    var extender = 'e';
    this.extendId = function(id) {
      return id + extender;
    };

    this.stripExtension = function(id) {
      return self.isExtendedId(id) ? id.slice(0, -1) : id;
    };

    function incDec(id, increment) {
      var idParts = parseId(id);
      var wId = idParts.pop();
      var sentenceId = idParts.pop();
      var wParts = wIdParts(wId);

      var newId  = wParts[1];
      var letter = wParts[2] || '';
      if (letter) {
        letter = increment ? letterAfter(letter) : letterInFront(letter);
      } else {
        if (increment) newId++; else newId--;
      }
      return self.getId(newId, sentenceId) + letter;
    }


    this.decrement = function(id) {
      return incDec(id, false);
    };

    this.increment = function(id) {
      return incDec(id, true);
    };

    function parseId(id) {
      return id.split('-');
    }

    this.nonSequentialIds = function(ids) {
      var nonSequential = {};
      angular.forEach(ids, function(id, i) {
        var next = ids[i + 1];
        if (next) {
          if (self.decrement(next) !== id) {
            nonSequential[i] = true;
          }
        }
      });
      return nonSequential;
    };
  }
]);
