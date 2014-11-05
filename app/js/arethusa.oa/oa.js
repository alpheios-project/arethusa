"use strict";

angular.module('arethusa.oa').service('oa', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    this.name = 'oa';

    var retriever;

    this.defaultConf = {
      template: 'templates/arethusa.oa/oa.html'
    };

    function configure() {
      configurator.getConfAndDelegate(self);
      retriever = configurator.getRetriever(self.conf.retriever);
    }

    this.init = function() {
      configure();

      // Just to see if the current setup works
      retriever.get(function(data) {
        console.log(data);
      });
    };
  }
]);
