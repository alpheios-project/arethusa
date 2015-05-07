'use strict';
angular.module('arethusa.morph').service('morph', [
  'state',
  'configurator',
  'plugins',
  'globalSettings',
  'keyCapture',
  'morphLocalStorage',
  'commons',
  'saver',
  'navigator',
  'exitHandler',
  function (
    state,
    configurator,
    plugins,
    globalSettings,
    keyCapture,
    morphLocalStorage,
    commons,
    saver,
    navigator,
    exitHandler
  ) {
    var self = this;
    this.name = 'morph';

    var morphRetrievers;
    var inventory;
    var searchIndex;

    // Shows a need to define the plugins name upfront - would
    // also spare a first configure round when the service is injected
    // for the first time.
    // Part of a larger change though to be done a little later.
    globalSettings.addColorizer('morph');

    this.canSearch = true;

    // When a user is moving fast between chunks, a lot of outstanding
    // requests can build up in the retrievers. As they are all asynchronous
    // their callbacks fire when we have already moved away from the chunk which
    // started the calls.
    // This can lead to quite a bit of confusion and is generally not a very
    // good solution.
    // We therefore use the new abort() API of Resource to cancel all requests
    // we don't need anymore. All morph retrievers need to provide an abort()
    // function now (usually just a delegator to Resource.abort).
    //
    // On init, we check if morphRetrievers were already defined and if they
    // are we abort all outstanding requests.
    function abortOutstandingRequests() {
      if (morphRetrievers) {
        angular.forEach(morphRetrievers, abortRetriever);
      }
    }

    function abortRetriever(retriever) {
      var fn = retriever.abort;
      if (angular.isFunction(fn)) fn();
    }


    this.defaultConf = {
      mappings: {},
      gloss: false,
      matchAll: true,
      preselect: false,
      localStorage: true,
      storePreferences: true
    };

    function configure() {
      var props = [
        'postagSchema',
        'attributes',
        'mappings',
        'noRetrieval',
        'gloss',
        'localStorage',
        'storePreferences'
      ];

      configurator.getConfAndDelegate(self, props);
      configurator.getStickyConf(self, ['preselect', 'matchAll']);

      self.analyses = {};
      morphRetrievers = configurator.getRetrievers(self.conf.retrievers);
      propagateMappings(morphRetrievers);

      if (self.localStorage) {
        morphRetrievers.localStorage = morphLocalStorage.retriever;
        morphLocalStorage.comparator = isSameForm;
      }

      // This is useful for the creation of new forms. Usually we want to
      // validate if all attributes are set properly - the inclusion of
      // special empty attributes allows to say specifically that something
      // should be left unannotated/unknown. Useful for elliptic nodes etc.
      addSpecialEmptyAttributes();

      if (self.conf.lexicalInventory) {
        inventory = configurator.getRetriever(self.conf.lexicalInventory.retriever);
      }

      colorMap = undefined;
      searchIndex = {};
    }

    var emptyAttribute = {
      long: '---',
      short: '---',
      postag: '_'
    };

    function addSpecialEmptyAttribute(attrObj, name) {
      attrObj.values['---'] = emptyAttribute;
    }

    function addSpecialEmptyAttributes() {
      angular.forEach(self.attributes, addSpecialEmptyAttribute);
    }

    function mappingFor(name) {
      // this exists so that mapping instances can refer to each
      // other through providing a string instead of an mappings
      // object.
      var mappings = self.mappings[name];
      while (angular.isString(mappings)) {
        mappings = self.mappings[name];
      }
      return mappings || {};
    }

    function propagateMapping(retriever, name) {
      retriever.mapping = mappingFor(name);
    }

    function propagateMappings(retrievers) {
      angular.forEach(retrievers, propagateMapping);
    }

    function getDataFromInventory(form) {
      if (inventory && form.lexInvLocation) {
        var urn = form.lexInvLocation.urn;
        inventory.getData(urn, form);
      }
    }

    function Forms(string) {
      this.string = string;
      this.forms  = [];
      this.analyzed = false;
    }

    function seedAnalyses() {
      return arethusaUtil.inject({}, state.tokens, function (obj, id, token) {
        obj[id] = new Forms(token.string);
      });
    }

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

    function createEmptyPostag() {
      return arethusaUtil.map(self.postagSchema, function (el) {
        return '-';
      }).join('');
    }

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
            return e.short === val || e.long === val;
          });
          return valObj ? valObj.postag : '-';
        });
      return postagArr.join('');
    };

    this.emptyForm = function(string) {
      return {
        lemma: string,
        postag: self.emptyPostag,
        attributes: emptyAttributes()
      };
    };

    function emptyAttributes() {
      return arethusaUtil.inject({}, self.postagSchema, function(memo, el) {
        memo[el] = undefined;
      });
    }

    // Gets a from the inital state - if we load an already annotated
    // template, we have to take it inside the morph plugin.
    // In the concrete use case of treebanking this would mean that
    // we have a postag value sitting there, which we have to expand.
    //
    // Once we have all information we need, the plugin also tries to
    // write back style information to the state object, e.g. to colorize
    // tokens according to their Part of Speech value.
    function getAnalysisFromState (val, id) {
      var analysis = state.tokens[id].morphology;
      // We could always have no analysis sitting in the data we are
      // looking at - no data also means that the postag is an empty
      // string or an empty postag.
      //
      // The other case we might encounter here is an object that has
      // only attributes defined, but no postag
      if (analysis) {
        var attrs = analysis.attributes;

        if (postagNotEmpty(analysis.postag)) {
          self.postagToAttributes(analysis);
        } else if (attrs) {
          analysis.postag = self.attributesToPostag(attrs);
        } else {
          return;
        }

        analysis.origin = 'document';
        analysis.selected = true;
        setGloss(id, analysis);
        val.forms.push(analysis);

        if (isColorizer()) state.addStyle(id, self.styleOf(analysis));
      }
    }

    function postagNotEmpty(postag) {
      return postag && !postag.match(/^-*$/);
    }

    function mapAttributes(attrs) {
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
    }

    // When we find no form even after retrieving, we need to unset
    // the token style. This is important when we move from chunk
    // to chunk, as token might still have style from a former chunk.
    // When no analysis is present, this can be very misleading.
    function unsetStyleWithoutAnalyses(forms, id) {
      if (forms.length === 0 && isColorizer()) {
        state.unsetStyle(id);
      }
    }

    // The BspMorphRetriever at times returns quite a lot of duplicate
    // forms - especially identical forms classified as coming from a
    // different dialect. We don't need this information right now, so
    // we can ignore such forms
    function makeUnique(forms) {
      return aU.unique(forms, function(a, b) {
        return a.lemma === b.lemma && a.postag === b.postag;
      });
    }

    this.getExternalAnalyses = function (analysisObj, id) {
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
          var str = analysisObj.string;
          var forms = analysisObj.forms;
          mergeDuplicateForms(forms[0], res);
          var newForms = makeUnique(res);
          arethusaUtil.pushAll(forms, newForms);

          // @balmas we need to comment this out for
          // now - because we don't always want to override
          // the user's selection to the most frequent, only when
          // they haven't chose something else
          //sortByPreference(str, forms);

          if (self.preselect) {
            preselectForm(forms[0], id);
          }

          unsetStyleWithoutAnalyses(forms, id);
        });
      });
    };

    function mergeDuplicateForms(firstForm, otherForms) {
      if (firstForm && firstForm.origin === 'document') {
        var duplicate;
        for (var i = otherForms.length - 1; i >= 0; i--){
          var el = otherForms[i];
          if (isSameForm(firstForm, el)) {
            duplicate = el;
            break;
          }
        }
        if (duplicate) {
          var oldSelectionState = firstForm.selected;
          angular.extend(firstForm, duplicate);
          firstForm.origin = 'document';
          firstForm.selected = oldSelectionState;
          otherForms.splice(otherForms.indexOf(duplicate), 1);
        }
      }
    }

    function isSameForm(a, b) {
      return a.lemma === b.lemma && a.postag === b.postag;
    }

    function selectedForm(id) {
      return state.getToken(id).morphology;
    }

    function preselectForm(form, id) {
      if (form && selectedForm(id) !== form) {
        state.doSilent(function() {
          self.setState(id, form);
        });
      }
    }

    function loadInitalAnalyses() {
      if (self.noRetrieval !== "all") {
        angular.forEach(self.analyses, loadToken);
      }
    }

    function loadToken(val, id) {
      getAnalysisFromState(val, id);
      if (self.noRetrieval !== "online") {
        self.getExternalAnalyses(val, id);
      } else {
        // We only need to do this when we don't
        // retrieve externally. If we do, we call
        // this function from within the request's
        // callback.
        unsetStyleWithoutAnalyses(val.forms, id);
      }
      val.analyzed = true;
      self.resetCustomForm(val, id);
    }

    self.preselectToggled = function() {
      if (self.preselect) applyPreselections();
    };

    this.hasSelection = function(analysis) {
      var hasSelection;
      for (var i = analysis.forms.length - 1; i >= 0; i--){
        if (analysis.forms[i].selected) {
          hasSelection = true;
          break;
        }
      }
      return hasSelection;
    };

    function applyPreselection(analysis, id) {
      if (analysis.forms.length > 0) {
        if (!self.hasSelection(analysis)) {
          self.setState(id, analysis.forms[0]);
        }
      }
    }

    function applyPreselections() {
      angular.forEach(self.analyses, applyPreselection);
    }

    self.resetCustomForm = function(val, id) {
      var string = state.asString(id);
      val.customForm = self.emptyForm(string);
    };

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


    function createColorMap() {
      var keys = ['long', 'postag'];
      var maps = [];
      var map = { header: keys, maps: maps };

      angular.forEach(self.attributes, function(value, key) {
        var colors = {};
        var obj = { label: value.long, colors: colors };
        aU.inject(colors, value.values, function(memo, k, v) {
          var key = aU.flatten(aU.map(keys, v)).join(' || ');
          memo[key] = v.style;
        });
        maps.push(obj);
      });

      return map;
    }

    var colorMap;
    this.colorMap = function() {
      if (!colorMap) colorMap = createColorMap();
      return colorMap;
    };

    this.applyStyling = function() {
      angular.forEach(state.tokens, function(token, id) {
        var form = token.morphology;
        if (form) {
          state.addStyle(id, self.styleOf(form));
        } else {
          state.unsetStyle(id);
        }
      });
    };

    this.styleOf = function (form) {
      var fullStyle = {};
      angular.forEach(form.attributes, function(value, key) {
        var style = self.attributeValueObj(key, value).style;
        angular.extend(fullStyle, style);
      });
      return fullStyle;
    };

    this.removeForm = function(id, form) {
      var forms = self.analyses[id].forms;
      var i = forms.indexOf(form);
      self.removeFromLocalStorage(state.asString(id), form);
      forms.splice(i, 1);
    };

    this.addToLocalStorage = function(string, form) {
      if (self.localStorage) {
        morphLocalStorage.addForm(string, form);
      }
    };

    this.removeFromLocalStorage = function(string, form) {
      if (self.localStorage) {
        morphLocalStorage.removeForm(string, form);
      }
    };

    function deselectAll(id) {
      angular.forEach(self.analyses[id].forms, function(form, i) {
        form.selected = false;
      });
    }

    function undoFn(id) {
      var current = selectedForm(id);
      if (current) {
        return function() { self.setState(id, current); };
      } else
        return function() { self.unsetState(id); };
    }

    function preExecFn(id, form) {
      return function() {
        deleteFromIndex(id);
        addToIndex(form, id);
        deselectAll(id);
        form.selected = true;

        if (isColorizer()) state.addStyle(id, self.styleOf(form));
      };
    }

    function setGloss(id, form) {
      if (self.gloss) self.analyses[id].gloss = form.gloss;
    }

    this.updateGloss = function(id, form) {
      if (self.gloss) {
        state.broadcast('tokenChange');
        var gloss = self.analyses[id].gloss || '';
        form = form || selectedForm(id);
        form.gloss = gloss;
      }
    };

    function isColorizer() {
      return globalSettings.isColorizer('morph');
    }

    this.setState = function (id, form) {
      self.updateGloss(id);
      state.change(id, 'morphology', form, undoFn(id), preExecFn(id, form));
    };

    function unsetUndo(id) {
      var current = selectedForm(id);
      return function() {
        self.setState(id, current);
      };
    }

    function unsetPreExec(id) {
      return function() {
        deleteFromIndex(id);
        deselectAll(id);
        selectedForm(id).selected = false;

        if (isColorizer()) state.unsetStyle(id);
      };
    }

    this.unsetState = function (id) {
      state.change(id, 'morphology', null, unsetUndo(id), unsetPreExec(id));
    };

    this.rulesOf = function (attr) {
      return self.selectAttribute(attr).rules;
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

    function loadSearchIndex() {
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
        if (ids) {
          var i = ids.indexOf(id);
          while (i !== -1) {
            ids.splice(i, 1);
            i = ids.indexOf(id);
          }
        }
      });
    }

    this.canEdit = function() {
      return self.mode === "editor";
    };

    state.on('tokenAdded', function(event, token) {
      var id = token.id;
      var forms = new Forms(token.string);
      self.analyses[id] = forms;
      token.morphology = {};
      loadToken(forms, id);
    });

    state.on('tokenRemoved', function(event, token) {
      var id = token.id;
      deleteFromIndex(id);
      delete self.analyses[id];
    });

    function guardSelection(fn) {
      if (plugins.isSelected(self)) {
        var selectionCount = state.hasClickSelections();
        if (selectionCount === 1) fn();
      }
    }

    function selectSurroundingForm(dir) {
      var id = Object.keys(state.clickedTokens)[0];
      var forms = self.analyses[id].forms;
      var currentIndex = forms.indexOf(selectedForm(id));

      var index;
      if (dir) {
        index = (currentIndex === forms.length - 1) ? 0 : currentIndex + 1;
      } else {
        index = (currentIndex === 0) ? forms.length - 1 : currentIndex - 1;
      }
      self.setState(id, forms[index]);
    }

    function selectNext() {
      guardSelection(function() {
        selectSurroundingForm(true);
      });
    }

    function selectPrev() {
      guardSelection(function() {
        selectSurroundingForm();
      });
    }

    this.activeKeys = {};
    var keys = keyCapture.initCaptures(function(kC) {
      return {
        morph: [
          kC.create('selectNextForm', function() { kC.doRepeated(selectNext); }, '↓'),
          kC.create('selectPrevForm', function() { kC.doRepeated(selectPrev); }, '↑')
        ]
      };
    });

    angular.extend(self.activeKeys, keys.selections);

    this.settings = [
      commons.setting('Expand Selected', 'expandSelection'),
      commons.setting('Store Preferences', 'storePreferences'),
      commons.setting('Preselect', 'preselect', this.preselectToggled),
      commons.setting('Local Storage', 'localStorage')
    ];

    var shouldSavePreference;
    function afterSave() {
      shouldSavePreference = true;
    }

    function sortByPreference(string, forms) {
      return morphLocalStorage.sortByPreference(string, forms);
    }

    function savePreferences() {
      if (shouldSavePreference && self.storePreferences) {
        angular.forEach(state.tokens, savePreference);
        shouldSavePreference = false;
      }
    }

    function savePreference(token) {
      if (token.morphology && token.morphology.postag) {
        morphLocalStorage.addPreference(token.string, token.morphology);
      }
    }

    saver.onSuccess(afterSave);
    navigator.onMove(savePreferences);
    exitHandler.onLeave(savePreferences);

    this.init = function () {
      abortOutstandingRequests();
      configure();
      self.emptyPostag = createEmptyPostag();
      self.analyses = seedAnalyses();
      loadInitalAnalyses();
      loadSearchIndex();
      plugins.declareReady(self);
    };
  }
]);
