'use strict';
angular.module('arethusa.relation').service('relation', [
  'state',
  'configurator',
  function (state, configurator) {
    var self = this;

    this.canSearch = true;

    function configure() {
      configurator.getConfAndDelegate('relation', self);
      self.relationValues = self.conf.relations;
      self.relations = {};
    }

    configure();

    // Currently selected labels
    this.currentLabels = function () {
      return arethusaUtil.inject({}, state.selectedTokens, function (memo, id, event) {
        memo[id] = self.relations[id];
      });
    };

    // Label handling
    function splitLabel(relation) {
      var split = relation.label.split('_');
      relation.prefix = split[0];
      relation.suffix = split[1];
    }

    this.buildLabel = function (relation) {
      var elements = [
          relation.prefix,
          relation.suffix
        ];
      var clean = arethusaUtil.inject([], elements, function (memo, el) {
          if (el) {
            memo.push(el);
          }
        });
      relation.label = clean.join('_');
    };

    this.prefixWithAncestors = function(relation) {
      return arethusaUtil.inject([], relation.ancestors, function(memo, ancestor) {
        memo.push(ancestor.short);
      }).join(' > ') || '---';
    };

    this.suffixOrPlaceholder = function(relation) {
      return relation.suffix || '---';
    };

    this.usePrefix = 'prefix';
    this.useSuffix = 'suffix';
    this.defineAncestors = true;

    // This function is a disgrace. Please refactor.
    function getRelationValueObj(prefix) {
      var hits = arethusaUtil.findNestedProperties(self.relationValues, prefix);
      try {
        return hits[prefix][0][prefix];
      } catch(e) {}
    }
    this.initAncestors = function(relation) {
      // calculate a real ancestor chain here if need be
      var prefix = relation.prefix;
      var ancestors = [];
      if (prefix) {
        var obj = getRelationValueObj(prefix);
        if (obj) ancestors.push(obj);
      }
      relation.ancestors = ancestors;
    };

    this.expandRelation = function (relation) {
      splitLabel(relation);
      self.initAncestors(relation);
      return relation;
    };

    // Empty template for relation objects
    this.relationTemplate = function () {
      return {
        prefix: '',
        suffix: '',
        label: '',
        ancestors: []
      };
    };

    // Search/Selector
    this.resetSearchedLabel = function () {
      self.searchedLabel = self.relationTemplate();
    };

    this.selectByLabel = function (label) {
      var ids = arethusaUtil.inject([], self.relations, function (memo, id, rel) {
          if (rel.relation.label === label) {
            memo.push(id);
          }
        });
      state.multiSelect(ids);
    };

    this.buildLabelAndSearch = function(rel) {
      rel = rel ? rel : self.searchedLabel;
      self.buildLabel(rel);
      self.selectByLabel(rel.label);
    };

    // Multi-changer
    this.resetMultiChanger = function () {
      this.multiChanger = self.relationTemplate();
    };

    this.applyMultiChanger = function () {
      angular.forEach(self.currentLabels(), function (obj, id) {
        angular.extend(obj.relation, self.multiChanger);
      });
    };

    this.multiChangePossible = function () {
      // We check for the prefix, as only a suffix, which would
      // fill the label already would not be allowed.
      //
      // Tokens need to be selected to of course.
      return self.multiChanger.prefix !== '' &&
        state.hasSelections();
    };

    // Init
    function addToInternalState(container, id, token) {
      if (!token.relation) token.relation = self.relationTemplate();
      container[id] = {
        string: token.string,
        relation: self.expandRelation(token.relation || '')
      };
    }

    this.createInternalState = function () {
      return arethusaUtil.inject({}, state.tokens, addToInternalState);
    };

    this.canEdit = function() {
      return self.mode === "editor";
    };

    state.on('tokenAdded', function(event, token) {
      addToInternalState(self.relations, token.id, token);
    });

    state.on('tokenRemoved', function(event, token) {
      delete self.relations[token.id];
    });

    this.init = function () {
      configure();
      self.relations = self.createInternalState();
      self.resetSearchedLabel();
      self.resetMultiChanger();
    };
  }
]);
