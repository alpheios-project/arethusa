"use strict";

/**
 * @ngdoc service
 * @name arethusa.core.idHandler
 *
 * @description
 * Translates, formats, increments token IDs.
 *
 */
angular.module('arethusa.core').service('idHandler', [
  'errorDialog',
  function(errorDialog) {
    var self = this;

    /**
     * @ngdoc property
     * @name assigned
     * @propertyOf arethusa.core.idHandler
     *
     * @description
     * Stores the currently assigned sourceIds
    */
    var assigned = {};

    /**
     * Returns either padded id or padded sentenceId and id
     * @param id
     * @param sentenceId
     * @returns {string}
       */
    this.getId = function(id, sentenceId) {
      var s = sentenceId ? arethusaUtil.formatNumber(sentenceId, 4) : '';
      var w = arethusaUtil.formatNumber(id, 4);
      return s ? s + '-' + w : w;
    };

    // Backwards compatibility function for TreebankRetriever -
    // can be removed at a later stage. Check the function
    // padWithSentenceId there.
    /**
     * Returns a formatted string of padded sentenceId and id
     * @param id
     * @param sentenceId
     * @returns {string}
       */
    this.padIdWithSId = function(id, sentenceId) {
      var s = aU.formatNumber(sentenceId, 4);
      return s + '-' + id;
    };

    /**
     * 
     * @param id
     * @param format
     * @returns {string|*}
       */
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
    
    /**
     * @ngdoc function
     * @name arethusa.core.idHandler#unassignSourceId
     * @methodOf arethusa.core.idHandler
     *
     * @description
     * clears out the idHandler's internal record of sourceids 
     * assigned for the supplied token
     *
     * @param {Token} token Token whose sourceids are being cleared
     *
     */
    this.unassignSourceId = function(token) {
      token.idMap.clearSourceIdAssignments(token.sentenceId);
    };

    /**
     * @ngdoc function
     * @name arethusa.core.idHandler#assignSourceId
     * @methodOf arethusa.core.idHandler
     *
     * @description
     * responds to a request to assign a new sourceId for a token
     *
     * @param {Token} token Token whose sourceids are being cleared
     *
     * @returns {Boolean} true if the sourceId can be assigned and
     *   false if the sourceId is already taken
     */
    function assignSourceId(sentenceId,sourceId,docId) {
      var canAssign = false;
      if (!angular.isDefined(assigned[docId])) {
        assigned[docId] = {};
      }
      if (! angular.isDefined(assigned[docId][sentenceId])) {
       assigned[docId][sentenceId] = {};
      }
      var alreadyAssigned = assigned[docId][sentenceId][sourceId];
      if (! alreadyAssigned) {
        canAssign = assigned[docId][sentenceId][sourceId] = true;
      }
      if (!canAssign) {
        errorDialog.sendError("Unexpected error calculating token mappings for sourceid: " + sourceId);
      }
      return canAssign;
    }

    function wIdParts(wId) {
      return /(\d*)(\w*)?/.exec(wId);
    }

    function parseId(id) {
      return id.split('-');
    }
    
    this.Map = function() {
      var self = this;
      this.mappings = {};

      this.add = function(identifier, internalId, sourceId, sentenceId) {
        // we only want to add sourceid mapping if the sourceid hasn't already
        // been assigned. We might want to do something other than quietly fail in this
        // case, but it's not clear what.
        // Note that sentences can get idMappings too, but in this case the source id mappings
        // are fairly useless so we can quietly fail in this case too
        if (angular.isDefined(sentenceId) && assignSourceId(sentenceId,sourceId,identifier)) {
          self.mappings[identifier] = new IdMapping(internalId, sourceId);
        }
        return self.mappings[identifier];

        function IdMapping(internalId, sourceId) {
          // We don't need the internalId here strictly speaking, but who knows...
          this.internalId = internalId;
          this.sourceId   = sourceId;
        }
      };

      this.sourceId = function(identifier) {
        var map = self.mappings[identifier];
        if (map) return map.sourceId;
      };

      this.clearSourceIdAssignments = function(sentenceId) {
        angular.forEach(Object.keys(self.mappings), function(docId,i) {
          assigned[docId][sentenceId][self.sourceId(docId)] = false;
        });
      };
    };

      /**
       * Revert internal Ids to sourceIds for exporting and persisting
       * @param tokens
       * @param docIdentifier
       * @param idCreator
       * @returns {*}
       */
    this.transformToSourceIds = function(tokens, docIdentifier, idCreator) {
      var transformation = new Transformation();
      return arethusaUtil.inject(transformation, tokens, function(memo, id, token) {
        memo.add(token, docIdentifier, idCreator);
      });
      
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
            self.fullMap[internalId] = sourceId;
          } else {
            self.unmapped.push(token);
            sourceId = idCreator();
            if (angular.isDefined(token.idMap.add(identifier, internalId, sourceId, token.sentenceId))) {
              // only add the sourceId to the fullMap if we actually were able to assign it
              // currently we silently fail if we can't but we may want to eventually throw an error notification
              // here
              self.fullMap[internalId] = sourceId;
            }
          }
        };
      }
    };

    var alphabet = [];
    for (var i = 97; i < 123; i++){
      alphabet.push(String.fromCharCode(i));
    }

    /**
     * Has the Id a letter at the last position?
     * @param id
     * @returns {*}
       */
    this.isExtendedId = function(id) {
      return id.match(/.*[a-z]$/);
    };

    var extender = 'e';
    /**
     * Append the character in 'extender' to the Id
     * @param id
     * @returns {string}
       */
    this.extendId = function(id) {
      return id + extender;
    };

    /**
     * Remove the letter in the last position if there is one
     * @param id
     * @returns {*}
       */
    this.stripExtension = function(id) {
      return self.isExtendedId(id) ? id.slice(0, -1) : id;
    };

    /**
     * Increment or decrement a wordId
     * @param id
     * @param increment
     * @returns {string}
       */
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

      function letterInFront(letter) {
        var i = alphabet.indexOf(letter) - 1;
        return alphabet[i];
      }
      function letterAfter(letter) {
        var i = alphabet.indexOf(letter) + 1;
        return alphabet[i];
      }

    }

    this.decrement = function(id) {
      return incDec(id, false);
    };

    this.increment = function(id) {
      return incDec(id, true);
    };
    
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
