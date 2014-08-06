'use strict';

/* global jsondiffpatch */

angular.module('arethusa.review').service('review', [
  'configurator',
  'state',
  'morph',
  '$rootScope',
  'navigator',
  function (configurator, state, morph, $rootScope, navigator) {
    var self = this;
    var retriever;
    var doc;
    self.goldTokens = {};

    self.defaultConf = {
      "name" : "review",
      "link" : true
    };

    function configure() {
      var props = ['link'];
      configurator.getConfAndDelegate('review', self, props);
      self.comparators = [
        'morphology.lemma',
        'morphology.attributes',
        'head.id',
        'relation.label'
      ];
      var retrievers = configurator.getRetrievers(self.conf.retrievers);
      retriever = retrievers.TreebankRetriever;
    }

    configure();

    function addStyleInfo(tokens) {
      angular.forEach(tokens, function (token, id) {
        var form = token.morphology;
        if (form) {
          morph.postagToAttributes(form);
          token.style = morph.styleOf(form);
        }
      });
    }

    function broadcast() {
      $rootScope.$broadcast('diffLoaded');
    }

    self.goToCurrentChunk = function() {
      if (!doc) return; // in case this gets called before we're ready

      self.pos = navigator.status.currentPos;
      self.goldTokens = doc[self.pos].tokens;
      addStyleInfo(self.goldTokens);
    };

    function loadDocument() {
      retriever.getData(function (res) {
        doc = res;
        self.goToCurrentChunk();
      });
    }


    function extract(obj) {
      return arethusaUtil.inject({}, obj, function(memo, id, token) {
        memo[id] = arethusaUtil.copySelection(token, self.comparators);
      });
    }

    this.compare = function () {
      var diff = jsondiffpatch.diff(
        extract(state.tokens),
        extract(self.goldTokens)
      );

      if (diff) {
        angular.forEach(diff, function (diff, id) {
          state.setState(id, 'diff', diff);
        });
        broadcast();
      }
    };

    loadDocument();

    this.init = function () {
      configure();
      if (self.link) {
        self.goToCurrentChunk();
      }
    };
  }
]);
