"use strict";

angular.module('arethusa.review').service('review', function(configurator) {
  var self = this;

  var conf = configurator.configurationFor('review');
  this.template = conf.template;
  this.name = conf.name;

  this.goldTokens = {};

  var retrievers = configurator.getRetrievers(conf.retrievers);
  var retriever = retrievers.TreebankRetriever;

  retriever.getData(function(res) {
    self.goldTokens = res[0].tokens;
  });
});
