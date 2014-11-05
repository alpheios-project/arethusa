"use strict";

angular.module('arethusa.oa').service('oa', [
  'state',
  'configurator',
  'oaHandler',
  function(state, configurator, oaHandler) {
    var self = this;
    this.name = 'oa';

    this.creatorOpen = false;

    var retriever, persister;

    this.defaultConf = {
      template: 'templates/arethusa.oa/oa.html'
    };

    function configure() {
      configurator.getConfAndDelegate(self);
      retriever = configurator.getRetriever(self.conf.retriever);
      persister = configurator.getPersister(self.conf.persister);
    }

    function createInternalAnnotations() {
      return arethusaUtil.inject({}, state.tokens, function(memo, id, token) {
        memo[id] = token;
      });
    }

    this.toggleCreator = function() {
      self.creatorOpen = !self.creatorOpen;
    };

    this.getTarget = function() {
      return oaHandler.generateTarget(Object.keys(state.clickedTokens));
    };

    this.save = function(target, body) {
      console.log(target, body);
    };

    this.ontologies = {
      'SAWS' : 'saws ont',
      'foo'  : 'foo ont'
    }

    this.init = function() {
      configure();

      self.annotations = createInternalAnnotations();
      retriever.get(function(data) { console.log(data); });
    };
  }
]);
