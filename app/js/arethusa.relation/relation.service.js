'use strict';
angular.module('arethusa.relation').service('relation', [
  'state',
  'configurator',
  function (state, configurator) {
    var self = this;
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
    this.expandRelation = function (relation) {
      splitLabel(relation);
      return relation;
    };
    // Empty template for relation objects
    this.relationTemplate = function () {
      return {
        prefix: '',
        suffix: '',
        label: ''
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
    this.buildLabelAndSearch = function (rel) {
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
    this.multiChangerEmpty = function () {
      // We check for the prefix, as only a suffix, which would
      // fill the label already would not be allowed.
      return self.multiChanger.prefix === '';
    };
    // Init
    this.createInternalState = function () {
      return arethusaUtil.inject({}, state.tokens, function (memo, id, token) {
        memo[id] = {
          string: token.string,
          relation: self.expandRelation(token.relation)
        };
      });
    };
    this.init = function () {
      configure();
      self.relations = self.createInternalState();
      self.resetSearchedLabel();
      self.resetMultiChanger();
    };
  }
]);