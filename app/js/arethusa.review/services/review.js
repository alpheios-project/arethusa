'use strict';

/* global jsondiffpatch */

angular.module('arethusa.review').service('review', [
  'configurator',
  'state',
  '$rootScope',
  'navigator',
  'plugins',
  function (configurator, state, $rootScope, navigator, plugins) {
    var self = this;
    this.name = "review";

    var retriever;
    var doc;

    this.externalDependencies = [
      "https://cdnjs.cloudflare.com/ajax/libs/jsondiffpatch/0.1.43/jsondiffpatch.min.js"
    ];

    self.goldTokens = {};

    self.defaultConf = {
      link : true,
      contextMenu : true,
      contextMenuTemplate : "js/arethusa.review/templates/context_menu.html"
    };

    function DiffCounts() {
      this.tokens = 0;
      this.attrs  = 0;
    }

    var lazyMorph;
    function morph() {
      if (!lazyMorph) lazyMorph = plugins.get('morph');
      return lazyMorph;
    }

    function configure() {
      configurator.getConfAndDelegate(self, ['hideMode']);
      configurator.getStickyConf(self, ['link', 'autoDiff']);
      self.comparators = [
        'morphology.lemma',
        'morphology.postag',
        'head.id',
        'relation.label'
      ];
      if (self.hideMode) {
        self.contextMenu = false;
        self.autoDiff = false;
        self.link = true;
      }
      var retrievers = configurator.getRetrievers(self.conf.retrievers);
      retriever = retrievers.TreebankRetriever;
      self.diffActive = false;
    }

    function addStyleInfo(tokens) {
      angular.forEach(tokens, function (token, id) {
        var form = token.morphology;
        if (form) {
          morph().postagToAttributes(form);
          token.style = morph().styleOf(form);
        }
      });
    }

    function broadcast() {
      self.diffActive = true;
      $rootScope.$broadcast('diffLoaded');
    }

    self.goToCurrentChunk = function() {
      self.pos = navigator.status.currentPos;
      self.goldTokens = doc[self.pos].tokens;
      addStyleInfo(self.goldTokens);
    };

    function loadDocument() {
      retriever.get(function (res) {
        doc = res;
        postInit(true);
      });
    }


    function extract(obj) {
      return arethusaUtil.inject({}, obj, function(memo, id, token) {
        memo[id] = arethusaUtil.copySelection(token, self.comparators);
      });
    }

    function countDiffs() {
      var dC = self.diffCounts = new DiffCounts();
      angular.forEach(self.diff, function(d) {
        dC.tokens++;
        angular.forEach(d, function(attr) { dC.attrs++; });
      });
    }

    this.compare = function () {
      self.diff = jsondiffpatch.diff(
        extract(state.tokens),
        extract(self.goldTokens)
      );

      countDiffs();

      angular.forEach(self.diff, function (diff, id) {
        state.setState(id, 'diff', diff);
      });
      broadcast();
    };

    function postInit(initialLoad) {
      if (self.link || initialLoad) self.goToCurrentChunk();

      plugins.doAfter('depTree', function() {
        if (self.autoDiff) self.compare();
      });
    }

    this.init = function () {
      configure();

      if (!doc) {
        loadDocument();
      } else {
        postInit();
      }
    };
  }
]);
