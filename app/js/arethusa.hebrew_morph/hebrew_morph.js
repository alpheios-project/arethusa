"use strict";

angular.module('arethusa.hebrewMorph').service('hebrewMorph', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('hebrewMorph', self);
    }

    configure();

    function Form(id, score) {
      this.id = id;
      this.score = score;
    }

    function Morph(string) {
      this.string = string;
      this.forms = [];
    }

    function parsePrefix(form) {
      var prefix = form.prefix;
      var res = {};
      if (prefix) {
        res.string = prefix._surface;
      }
      return res;
    }
    function parseSuffix(form) {
      var suffix = form.suffix;
      var res = {};
      return res;
    }
    function parseBase(form) {
      var base = form.base;
      var res = {};
      if (base) {
        res.string = base._lexiconItem;
      }
      return res;
    }

    this.parse = function(xmlToken, token) {
      var morph = new Morph(token.string);
      token.morphology = morph;
      var analyses = arethusaUtil.toAry(xmlToken.analysis);
      angular.forEach(analyses, function(anal, i) {
        var form = new Form(anal._id, anal._score);
        form.base = parseBase(anal);
        form.prefix = parsePrefix(anal);
        form.suffix = parseSuffix(anal);
        morph.forms.push(form);
      });
    };

    this.currentSelection = function() {
      return arethusaUtil.inject({}, state.selectedTokens, function(memo, id, type) {
        memo[id] = state.getToken(id).morphology;
      });
    };

    this.init = function() {
      configure();
    };
  }
]);
