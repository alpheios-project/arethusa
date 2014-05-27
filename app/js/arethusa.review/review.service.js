"use strict";

angular.module('arethusa.review').service('review', function(configurator, state, morph, $rootScope) {
  var self = this;
  var retriever;

  function configure() {
    configurator.getConfAndDelegate('review', self);

    self.goldTokens = {};
    var retrievers = configurator.getRetrievers(self.conf.retrievers);
    retriever = retrievers.TreebankRetriever;
  }

  configure();


  function addStyleInfo(tokens) {
    angular.forEach(tokens, function(token, id) {
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

  retriever.getData(function(res) {
    self.goldTokens = res[0].tokens;
    addStyleInfo(self.goldTokens);
  });

  this.compare = function() {
    // mockup object right now
    var obj = {
      '0002' : {
        relation: {
          label: {
            original: 'OBJ',
            new: 'PNOM'
          }
        }
      },
      '0005' : {
        head: {
          id: {
            original: 7,
            new: 6
          }
        }
      },
      '0011' : {
        head: {
          id: {
            original: 16,
            new: 18
          }
        }
      },
      '0016' : {
        relation: {
          label: {
            original: 'OBJ',
            new: 'SBJ'
          }
        },
        lemma: {},
        postag: {}
      },
      '0017' : {
        relation: {
          label: {
            original: 'SBJ',
            new: 'ATR'
          }
        }
      }
    };

    if (obj) {
      angular.forEach(obj, function(diff, id) {
        state.setState(id, 'diff', diff);
      });
      broadcast();
    }
  };

  this.init = function() {
    configure();
  };
});
