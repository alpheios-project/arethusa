"use strict";

angular.module('arethusa.hebrewMorph').service('hebrewMorph', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    this.name = "hebrewMorph";

    function configure() {
      var props = [
        'styledThrough',
        'parts',
        'attributes'
      ];
      configurator.getConfAndDelegate(self, props);
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
    function parseSuffix(xmlForm, form, string) {
      var suffix = xmlForm.suffix;
      var res = {};
      if (suffix) {
        res.string = extractSuffixString(form, string);
      }
      return res;
    }

    function extractSuffixString(form, string) {
      var str;
      str = string.replace((form.prefix.string || ''), '');
      str = str.replace((form.base  .string || ''), '');
      return str;
    }

    function parseBase(form) {
      var base = form.base;
      var res = {};
      if (base) {
        res.string = base._lexiconItem;
        res.pos = Object.keys(base)[0];
      }
      return res;
    }

    this.styleOf = function (form) {
      var styler = self.styledThrough;
      var styleVal = form.base[styler];
      var valObj = self.attributes[styler].values[styleVal] || {};
      return valObj.style || {};
    };

    this.hyphenatedForm = function(form) {
      return arethusaUtil.inject([], self.parts, function(memo, el) {
        var str = form[el].string;
        if (str) memo.push(str);
      }).join(' - ');
    };

    this.parse = function(xmlToken, token) {
      var morph = new Morph(token.string);
      var forms = [];
      token.morphology = morph;
      var analyses = arethusaUtil.toAry(xmlToken.analysis);
      angular.forEach(analyses, function(anal, i) {
        var form = new Form(anal._id, anal._score);
        form.base = parseBase(anal);
        form.prefix = parsePrefix(anal);
        form.suffix = parseSuffix(anal, form, token.string);
        forms.push(form);
      });
      arethusaUtil.pushAll(morph.forms, forms.sort(function(a, b) {
        return a.score < b.score;
      }));
    };

    this.currentSelection = function() {
      return arethusaUtil.inject({}, state.selectedTokens, function(memo, id, type) {
        memo[id] = state.getToken(id).morphology;
      });
    };

    function setStyles() {
      angular.forEach(state.tokens, function(token, id) {
        var morph = token.morphology;
        state.setStyle(id, self.styleOf(morph.forms[0]));
      });
    }

    this.init = function() {
      configure();
      setStyles();
    };
  }
]);
