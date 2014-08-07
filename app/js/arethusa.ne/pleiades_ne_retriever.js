 'use strict';
/* A newable factory to handle Named Entity annotation 
 *
 * The constructor functions takes a configuration object (that typically
 * contains a resource object for this service).
 *
 */
angular.module('arethusa.ne').factory('PleiadesNeRetriever', [
  'configurator',
  function (configurator) {

 	return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      this.getWord = function (word) {
        return resource.get({ 'query': word });
      };
  }

}]);