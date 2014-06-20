"use strict";

angular.module('arethusa.sg').factory('SgGrammarRetriever', [
  'configurator',
  function(configurator) {
    function parseSections(sections) {}

    return function(conf) {
      var doc;
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      function selectAndCallback(sections, callback) {
        // parse the sections, and return the right ones instead of the doc
        callback(doc);
      }

      this.getData = function(sections, callback) {
        if (doc) {
          selectAndCallback(sections, callback);
          callback(doc);
        } else {
          resource.get().then(function(res) {
            doc = res;
            selectAndCallback(sections, callback);
          });
        }
      };
    };
  }
]);
