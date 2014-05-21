"use strict";

angular.module('arethusa.morph').service('morph', function(state, configurator) {
  this.conf = configurator.configurationFor('morph');
  this.attributes = this.conf.attributes;
  this.template = this.conf.template;
  this.name = this.conf.name;
  this.postagSchema = this.conf.postagSchema;
  this.styledThrough = this.conf.styledThrough;

  this.contextMenu = this.conf.contextMenu;
  this.contextMenuTemplate = this.conf.contextMenuTemplate;

  this.analyses = {};

  var morphRetrievers = configurator.getServices(this.conf.retrievers);

  this.seedAnalyses = function(tokens) {
    return arethusaUtil.inject({}, tokens, function(obj, id, token) {
      obj[id] = { string: token.string, forms: [], analyzed: false };
    });
  };

  this.postagToAttributes = function(form) {
    var that = this;
    var attrs = {};
    angular.forEach(form.postag, function(postagVal, i) {
      var postagClass  = that.postagSchema[i];
      var possibleVals = that.attributeValues(postagClass);
      var attrObj = arethusaUtil.findObj(possibleVals, function(obj) {
        return obj.postag === postagVal;
      });

      // attrObj can be undefined when the postag is -
      if (attrObj) {
        attrs[postagClass] = attrObj.short;
      }
    });
    form.attributes = attrs;
  };

  // Probably not useful to calculate this everytime...
  this.emptyPostag = function() {
    return arethusaUtil.map(this.postagSchema, function(el) {
      return '-';
    }).join('');
  };

  this.updatePostag = function(form, attr, val) {
    var index = this.postagSchema.indexOf(attr);
    var postag = this.postagValue(attr, val);
    form.postag = arethusaUtil.replaceAt(form.postag, index, postag);
  };

  this.attributesToPostag = function(attrs) {
    var postag = "";
    var that = this;
    var postagArr =  arethusaUtil.map(this.postagSchema, function(el) {
      var attrVals = that.attributeValues(el);
      var val = attrs[el];
      var valObj = arethusaUtil.findObj(attrVals, function(e) {
        return e.short === val;
      });
      return (valObj ? valObj.postag : '-');
    });
    return postagArr.join('');
  };

  // Gets a from the inital state - if we load an already annotated
  // template, we have to take it inside the morph plugin.
  // In the concrete use case of treebanking this would mean that
  // we have a postag value sitting there, which we have to expand.
  //
  // Once we have all information we need, the plugin also tries to
  // write back style information to the state object, e.g. to colorize
  // tokens according to their Part of Speech value.
  this.getAnalysisFromState = function(val, id) {
    var analysis = state.tokens[id].morphology;
    // We could always have no analysis sitting in the data we are
    // looking at.
    if (analysis) {
      this.postagToAttributes(analysis);
      analysis.origin = 'document';
      val.forms.push(analysis);
      state.setStyle(id, this.styleOf(analysis));
    }
  };

  var mapAttributes = function(attrs, that) {
    // We could use inject on attrs directly, but this wouldn't give us
    // the correct order of properties inside the newly built object.
    // Let's iterate over the postag schema for to guarantee it.
    // Sorting of objects is a problem we need a solution for in other
    // places as well.
    // This solution comes at a price - if we cannot find a key (not every
    // form has a tense attribute for example), we might stuff lots of undefined
    // stuff into this object. We pass over this with a conditional.
    return arethusaUtil.inject({}, that.postagSchema, function(memo, k) {
      var v = attrs[k];
      if (v) {
        var values = that.attributeValues(k);
        var obj = arethusaUtil.findObj(values, function(el) {
          return (el.short === v || el.long === v);
        });
        memo[k] = (obj ? obj.short : v);
      }
    });
  };

  this.getExternalAnalyses = function(analysisObj, that) {
    angular.forEach(morphRetrievers, function(retriever, name) {
      retriever.getData(analysisObj.string, function(res) {
        res.forEach(function(el) {
          // need to parse the attributes now
          el.attributes = mapAttributes(el.attributes, that);
          // and build a postag
          el.postag = that.attributesToPostag(el.attributes);
        });
        arethusaUtil.pushAll(analysisObj.forms, res);
      });
    });
  };

  this.loadInitalAnalyses = function(that) {
    var analyses = that.seedAnalyses(state.tokens);
    angular.forEach(analyses, function(val, id) {
      that.getExternalAnalyses(val, that);
      that.getAnalysisFromState(val, id);
      val.analyzed = true;
    });
    return analyses;
  };

  this.currentAnalyses = function() {
    var analyses = this.analyses;
    return arethusaUtil.inject({}, state.selectedTokens, function(obj, id, val) {
      var token = analyses[id];
      if (token) {
        obj[id] = token;
      }
    });
  };

  this.selectAttribute = function(attr) {
    return this.attributes[attr] || {};
  };

  this.longAttributeName = function(attr) {
    return this.selectAttribute(attr).long;
  };

  this.attributeValues = function(attr) {
    return this.selectAttribute(attr).values || {};
  };
  this.attributeValueObj = function(attr, val) {
    return this.attributeValues(attr)[val] || {};
  };

  this.longAttributeValue = function(attr, val) {
    return this.attributeValueObj(attr, val).long;
  };

  this.abbrevAttributeValue = function(attr, val) {
    return this.attributeValueObj(attr, val).short;
  };

  this.postagValue = function(attr, val) {
    return this.attributeValueObj(attr, val).postag;
  };

  this.concatenatedAttributes = function(form) {
    var res = [];
    var that = this;
    angular.forEach(form.attributes, function(value, key) {
      res.push(that.abbrevAttributeValue(key, value));
    });
    return res.join('.');
  };

  this.styleOf = function(form) {
    var styler = this.styledThrough;
    var styleVal = form.attributes[styler];
    return this.attributeValueObj(styler, styleVal).style;
  };

  this.setState = function(id, form) {
    state.setStyle(id, this.styleOf(form));
    state.setState(id, 'morphology', form);
  };

  this.unsetState = function(id) {
    state.unsetState(id, 'morphology');
  };

  this.isFormSelected = function(id, form) {
    return state.tokens[id].morphology == form;
  };

  this.init = function() {
    this.analyses = this.loadInitalAnalyses(this);
  };
});

