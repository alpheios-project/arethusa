"use strict";

angular.module('arethusa.core').service('idHandler', [
  function() {
    var self = this;

    this.getId = function(id) {
      return arethusaUtil.formatNumber(id, 4);
    };

    this.formatId = function(id, format) {
      if (!id) return;

      format = format ? format : '%w';
      // in case we have an id formatted like 1-1 here
      var idParts = parseId(id);
      var wId = idParts.pop();
      var wParts = wIdParts(wId);
      var wIdNumericPart = arethusaUtil.formatNumber(wParts[1]);
      var sId = arethusaUtil.formatNumber(idParts.pop(), 0);
      return format.replace('%w', wIdNumericPart + (wParts[2] || ''));
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

    this.transformToSoureIds = function(tokens, docIdentifier, idCreator) {
      var transformation = new Transformation();
      return arethusaUtil.inject(new Transformation(), tokens, function(memo, id, token) {
        memo.add(token, docIdentifier, idCreator);
      });
    };

    this.decrement = function(id) {
      var idParts = parseId(id);
      var wId = idParts.pop();
      var wParts = wIdParts(wId);
      var newWId = wParts[1] - 1;
      return self.getId(newWId) + (wParts[2] || '');
    };

    function parseId(id) {
      return id.split('-');
    }
  }
]);
