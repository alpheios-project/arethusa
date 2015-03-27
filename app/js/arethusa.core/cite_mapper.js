"use strict";

angular.module('arethusa.core').service('citeMapper', [
  '$cacheFactory',
  'configurator',
  function(
    $cacheFactory,
    configurator
  ) {
    var isInitialized, resource;
    var cache = $cacheFactory('citation', { number: 100 });

    this.get = get;

    function get(cite, callback) {
      init();
      if (!resource) callback(cite);
      if (!cite)     return;
      if (hasCtsUrn(cite)) {
        parseCtsUrn(cite, callback);
      } else {
        callback(cite);
      }
    }

    function init() {
      if (isInitialized) return;
      resource = configurator.provideResource('citeMapper');
      isInitialized = true;
    }

    function hasCtsUrn(cite) {
      // CTS urns might be prefixed with a uri
      // prefix and not appear at the beginng of the doc id
      return cite.match(/urn:cts/);
    }

    function parseCtsUrn(cite, callback) {
      var citation;
      var citeSplit = splitCiteString(cite);
      var doc = citeSplit[0];
      var sec = citeSplit[1];
      citation = cache.get(doc);
      if (! citation) {
        resource.get({ cite: doc}).then(function(res) {
          citation = res.data;
          cache.put(doc, citation);
          callback(citationToString(citation, sec));
        });
      } else {
        callback(citationToString(citation, sec));
      }
    }

    function splitCiteString(cite) {
      var i = cite.lastIndexOf(':');
      return [cite.slice(0, i), cite.slice(i + 1)];
    }

    function citationToString(citation, sec) {
      return [citation.author, citation.work, sec].join(' ');
    }
  }
]);
