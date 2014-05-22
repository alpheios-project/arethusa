"use strict";

angular.module('arethusa.review').service('review', function(configurator, morph) {
  var self = this;

  var conf = configurator.configurationFor('review');
  this.template = conf.template;
  this.name = conf.name;

  this.goldTokens = {};

  var retrievers = configurator.getRetrievers(conf.retrievers);
  var retriever = retrievers.TreebankRetriever;

  function addStyleInfo(tokens) {
    angular.forEach(tokens, function(token, id) {
      var form = token.morphology;
      if (form) {
        morph.postagToAttributes(form);
        token.style = morph.styleOf(form);
      }
    });
  }

  retriever.getData(function(res) {
    self.goldTokens = res[0].tokens;
    addStyleInfo(self.goldTokens);
  });
});
