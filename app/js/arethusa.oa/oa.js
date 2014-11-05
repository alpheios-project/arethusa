"use strict";

angular.module('arethusa.oa').service('oa', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    this.name = 'oa';

    var retriever, persister;

    this.defaultConf = {
      template: 'templates/arethusa.oa/oa.html'
    };

    function configure() {
      configurator.getConfAndDelegate(self);
      retriever = configurator.getRetriever(self.conf.retriever);
      persister = configurator.getPersister(self.conf.persister);
    }

    this.init = function() {
      configure();

      console.log(retriever, persister);
      retriever.get(function(data) { console.log(data); });
    };
  }
]);
