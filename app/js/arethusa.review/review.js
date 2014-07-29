'use strict';

/* global jsondiffpatch */

angular.module('arethusa.review').service('review', [
  'configurator',
  'state',
  'morph',
  '$rootScope',
  function (configurator, state, morph, $rootScope) {
    var self = this;
    var retriever;

    function configure() {
      configurator.getConfAndDelegate('review', self);
      self.goldTokens = {};
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
    retriever.getData(function (res) {
      self.goldTokens = res[0].tokens;
      addStyleInfo(self.goldTokens);
    });

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
    this.init = function () {
      configure();
    };
  }
]);
