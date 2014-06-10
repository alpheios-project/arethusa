'use strict';
angular.module('arethusa.morph').service('morph', [
  'state',
  'configurator',
  function (state, configurator) {
    var self = this;
    var morphRetrievers;
    var inventory;

    this.canSearch = true;

    function configure() {
      var props = [
        'postagSchema',
        'attributes',
        'styledThrough',
        'noRetrieval',
        'matchAll'
      ];

      configurator.getConfAndDelegate('morph', self, props);
      self.analyses = {};
      morphRetrievers = configurator.getRetrievers(self.conf.retrievers);

      if (self.conf.lexicalInventory) {
        inventory = configurator.getRetriever(self.conf.lexicalInventory.retriever);
      }
    }

    configure();

    function getDataFromInventory(form) {
      if (inventory) {
        var urn = form.lexInvLocation.urn;
        inventory.getData(urn, form);
      }
    }

    this.seedAnalyses = function (tokens) {
      return arethusaUtil.inject({}, tokens, function (obj, id, token) {
        obj[id] = {
          string: token.string,
          forms: [],
          analyzed: false
        };
      });
    };

    this.postagToAttributes = function (form) {
      var attrs = {};
      angular.forEach(form.postag, function (postagVal, i) {
        var postagClass = self.postagSchema[i];
        var possibleVals = self.attributeValues(postagClass);
        var attrObj = arethusaUtil.findObj(possibleVals, function (obj) {
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
    this.emptyPostag = function () {
      return arethusaUtil.map(self.postagSchema, function (el) {
        return '-';
      }).join('');
    };

    this.updatePostag = function (form, attr, val) {
      var index = self.postagSchema.indexOf(attr);
      var postag = self.postagValue(attr, val);
      form.postag = arethusaUtil.replaceAt(form.postag, index, postag);
    };

    this.attributesToPostag = function (attrs) {
      var postag = '';
      var postagArr = arethusaUtil.map(self.postagSchema, function (el) {
          var attrVals = self.attributeValues(el);
          var val = attrs[el];
          var valObj = arethusaUtil.findObj(attrVals, function (e) {
              return e.short === val;
            });
          return valObj ? valObj.postag : '-';
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
    this.getAnalysisFromState = function (val, id) {
      var analysis = state.tokens[id].morphology;
      // We could always have no analysis sitting in the data we are
      // looking at.
      if (analysis) {
        self.postagToAttributes(analysis);
        analysis.origin = 'document';
        val.forms.push(analysis);
        state.setStyle(id, self.styleOf(analysis));
      }
    };

    var mapAttributes = function (attrs) {
      // We could use inject on attrs directly, but this wouldn't give us
      // the correct order of properties inside the newly built object.
      // Let's iterate over the postag schema for to guarantee it.
      // Sorting of objects is a problem we need a solution for in other
      // places as well.
      // This solution comes at a price - if we cannot find a key (not every
      // form has a tense attribute for example), we might stuff lots of undefined
      // stuff into this object. We pass over this with a conditional.
      return arethusaUtil.inject({}, self.postagSchema, function (memo, k) {
        var v = attrs[k];
        if (v) {
          var values = self.attributeValues(k);
          var obj = arethusaUtil.findObj(values, function (el) {
              return el.short === v || el.long === v;
            });
          memo[k] = obj ? obj.short : v;
        }
      });
    };

    this.getExternalAnalyses = function (analysisObj) {
      angular.forEach(morphRetrievers, function (retriever, name) {
        retriever.getData(analysisObj.string, function (res) {
          res.forEach(function (el) {
            // need to parse the attributes now
            el.attributes = mapAttributes(el.attributes);
            // and build a postag
            el.postag = self.attributesToPostag(el.attributes);
            // try to obtain additional info from the inventory
            getDataFromInventory(el);
          });
          arethusaUtil.pushAll(analysisObj.forms, res);
        });
      });
    };

    function loadInitalAnalyses() {
      var analyses = self.seedAnalyses(state.tokens);
      if (self.noRetrieval !== "all") {
        angular.forEach(analyses, function (val, id) {
          if (self.noRetrieval !== "online") {
            self.getExternalAnalyses(val);
          }
          self.getAnalysisFromState(val, id);
          val.analyzed = true;
        });
      }
      return analyses;
    }

    this.currentAnalyses = function () {
      var analyses = self.analyses;
      return arethusaUtil.inject({}, state.selectedTokens, function (obj, id, val) {
        var token = analyses[id];
        if (token) {
          obj[id] = token;
        }
      });
    };

    this.selectAttribute = function (attr) {
      return self.attributes[attr] || {};
    };
    this.longAttributeName = function (attr) {
      return self.selectAttribute(attr).long;
    };
    this.attributeValues = function (attr) {
      return self.selectAttribute(attr).values || {};
    };
    this.attributeValueObj = function (attr, val) {
      return self.attributeValues(attr)[val] || {};
    };
    this.longAttributeValue = function (attr, val) {
      return self.attributeValueObj(attr, val).long;
    };
    this.abbrevAttributeValue = function (attr, val) {
      return self.attributeValueObj(attr, val).short;
    };
    this.postagValue = function (attr, val) {
      return self.attributeValueObj(attr, val).postag;
    };

    this.concatenatedAttributes = function (form) {
      var res = [];
      angular.forEach(form.attributes, function (value, key) {
        res.push(self.abbrevAttributeValue(key, value));
      });
      return res.join('.');
    };

    this.sortAttributes = function(attrs) {
      return arethusaUtil.inject([], self.postagSchema, function(memo, p) {
        var val = attrs[p];
        if (val) {
          memo.push({
            attr: p,
            val: val
          });
        }
      });
    };

    this.styleOf = function (form) {
      var styler = self.styledThrough;
      var styleVal = form.attributes[styler];
      return self.attributeValueObj(styler, styleVal).style;
    };

    this.setState = function (id, form) {
      deleteFromIndex(id);
      addToIndex(form, id);
      state.setStyle(id, self.styleOf(form));
      state.setState(id, 'morphology', form);
    };
    this.unsetState = function (id) {
      deleteFromIndex(id);
      state.unsetStyle(id);
      state.unsetState(id, 'morphology');
    };

    this.isFormSelected = function (id, form) {
      return state.tokens[id].morphology == form;
    };

    this.dependenciesOf = function (attr) {
      return self.selectAttribute(attr).dependencies;
    };

    function findThroughOr(keywords) {
      return arethusaUtil.inject({}, keywords, function(memo, keyword) {
        var hits = searchIndex[keyword] || [];
        angular.forEach(hits, function(id, i) {
          memo[id] = true;
        });
      });
    }

    function findThroughAll(keywords) {
      // we need to fill a first array which we can check against first
      var firstKw = keywords.shift();
      var hits = searchIndex[firstKw] || [];
      angular.forEach(keywords, function(keyword, i) {
        var moreHits = searchIndex[keyword] || [];
        hits = arethusaUtil.intersect(hits, moreHits);
      });
      // and know return something with unique values
      return arethusaUtil.inject({}, hits, function(memo, id) {
        memo[id] = true;
      });
    }

    this.queryForm = function() {
      var keywords = self.formQuery.split(' ');
      // The private fns return an object and not an array, even if we only
      // need ids - but we avoid duplicate keys that way.
      var ids = self.matchAll ? findThroughAll(keywords) : findThroughOr(keywords);
      state.multiSelect(Object.keys(ids));
    };

    var searchIndex;
    function createSearchIndex() {
      searchIndex = {};
      angular.forEach(state.tokens, function(token, id) {
        var form = token.morphology || {};
        addToIndex(form, id);
      });
    }

    function addToIndex(form, id) {
      var attrs = form.attributes || {};
      angular.forEach(attrs, function(val, key) {
        if (!searchIndex[val]) {
          searchIndex[val] = [];
        }
        searchIndex[val].push(id);
      });
    }

    function deleteFromIndex(id) {
      var form = state.getToken(id).morphology || {};
      var attrs = form.attributes || {};
      angular.forEach(attrs, function(value, key) {
        // the index might contain duplicate ids
        var ids = searchIndex[value];
        var i = ids.indexOf(id);
        while (i !== -1) {
          ids.splice(i, 1);
          i = ids.indexOf(id);
        }
      });
    }

    this.init = function () {
      configure();
      self.analyses = loadInitalAnalyses();
      createSearchIndex();
    };
  }
]);
