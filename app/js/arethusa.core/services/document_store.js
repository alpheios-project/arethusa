'use strict';

/**
 * Global hash table for Document instances
 */
angular.module('arethusa.core').service('documentStore', function () {
  var self = this;

  /**
   * Remove documents and configurations
   */
  this.reset = function () {
    this.store = {};
    this.confs = {};
  };

  /**
   * Store Document instance in associative array
   * @param location
   * @param doc
     */
  this.addDocument = function (location, doc) {
    self.store[location] = doc;
    extractConf(doc);

    function extractConf(doc) {
      angular.extend(self.confs, doc.conf);
    }
  };

  /**
   * Check if documentStore has stored configs from the documents
   * @returns {boolean}
     */
  this.hasAdditionalConfs = function() {
    return !angular.equals(self.confs, {});
  };

  this.reset();
});
