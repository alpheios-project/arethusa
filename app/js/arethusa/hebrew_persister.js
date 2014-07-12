"use strict";

angular.module('arethusa').factory('HebrewPersister', [
  'documentStore',
  'configurator',
  'navigator',
  'idHandler',
  function (documentStore, configurator, navigator, idHandler) {
    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var identifier = conf.docIdentifier;

      function updateDocument() {

      }

      function updateXml() {

      }

      function doc() {
        return documentStore.store[identifier];
      }


      this.saveData = function (callback, errCallback) {
        updateDocument();
        updateXml();
        resource.save(doc().xml,'text/xml').then(callback, errCallback);
      };
    };
  }
]);

