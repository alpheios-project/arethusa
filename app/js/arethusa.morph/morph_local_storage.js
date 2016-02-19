"use strict";

angular.module('arethusa.morph').service('morphLocalStorage', [
  'plugins',
  'arethusaLocalStorage',
  '_',
  function(plugins, arethusaLocalStorage, _) {
    var PREFERENCE_DELIMITER = ';;';
    var PREFERENCE_COUNT_DELIMITER = '@@';
    var LEMMA_POSTAG_DELIMITER = '|-|';
    var self = this;

    this.localStorageKey = 'morph.forms';
    this.preferenceKey = 'morph.prefs';

    this.delimiters = {
      preference: PREFERENCE_DELIMITER,
      count: PREFERENCE_COUNT_DELIMITER,
      lemmaToPostag: LEMMA_POSTAG_DELIMITER
    };

    this.retriever = {
      getData: getData,
      abort: function() {}
    };

    this.addForm = addForm;
    this.addForms = addForms;
    this.removeForm = removeForm;

    this.addPreference = addPreference;
    this.addPreferences = addPreferences;
    this.sortByPreference = sortByPreference;

    this.getForms = getForms;
    this.getPreferences = getPreferences;

    function key(k) {
      return self.localStorageKey + '.' + k;
    }

    function preferenceKey(k) {
      return self.preferenceKey + '.' + k;
    }


    function getData(string, callback) {
      var forms = retrieve(string);
      callback(forms);
    }

    function retrieve(string) {
      return arethusaLocalStorage.get(key(string)) || [];
    }

    function retrievePreference(string) {
      return arethusaLocalStorage.get(preferenceKey(string)) || '';
    }

    function persist(string, value) {
      arethusaLocalStorage.set(key(string), value);
    }

    function persistPreference(string, value) {
      return arethusaLocalStorage.set(preferenceKey(string), value);

    }

    function addForm(string, form) {
      // Check if we already stored info about this word,
      // if not add a need array to the store
      var forms = retrieve(string) || [];

      // Store a copy and set the selected property to false!
      var newForm = angular.copy(form);
      newForm.selected = false;
      forms.push(newForm);
      persist(string, forms);
    }

    function addForms(string, newForms) {
      var forms = retrieve(string) || [];
      var keys = _.map(forms, formToKey);
      _.forEach(newForms, function(form) {
        if (!_.contains(keys, formToKey(form))) {
          forms.push(form);
        }
      });
      persist(string, forms);
    }

    function removeForm(string, form) {
      var forms = retrieve(string);
      if (forms) {
        // find element and remove it, when it's present
        var stored = aU.find(forms, function (otherForm) {
          return self.comparator(form, otherForm);
        });
        if (stored) {
          forms.splice(forms.indexOf(stored), 1);
        }
        persist(string, forms);
      }
    }

    function addPreference(string, form, additor) {
      additor = parseInt(additor) || 1;
      var key = formToKey(form);
      var counts = preferencesToCounts(string, key);
      var counter = counts[key];
      var newCount = counter ? counter + additor : 1;
      counts[key] = newCount;
      var sortedCounts = toSortedArray(counts);
      var toStore = _.map(sortedCounts, function(countArr) {
        return countArr[0] + PREFERENCE_COUNT_DELIMITER + countArr[1];
      }).join(PREFERENCE_COUNT_DELIMITER);

      persistPreference(string, toStore);
    }

    function addPreferences(string, frequencies) {
      var data = frequencies.split(PREFERENCE_DELIMITER);
      return _.forEach(data, function(datum) {
        var formAndCount = datum.split(PREFERENCE_COUNT_DELIMITER);
        var lemmaAndPostag = formAndCount[0].split(LEMMA_POSTAG_DELIMITER);
        var count = formAndCount[1];
        var lemma = lemmaAndPostag[0];
        var postag  = lemmaAndPostag[1];
        addPreference(string, { lemma: lemma, postag: postag }, count);
      });
    }

    function toSortedArray(counts) {
      return _.map(counts, function(v, k) {
        return [k, v];
      }).sort(function(a, b) {
        return a[1] < b[1];
      });
    }

    function preferencesToCounts(string) {
      var prefs = retrievePreference(string).split(PREFERENCE_DELIMITER);
      return _.inject(_.filter(prefs), function(memo, pref) {
        var parts = pref.split(PREFERENCE_COUNT_DELIMITER);
        memo[parts[0]] = parseInt(parts[1]);
        return memo;
      }, {});
    }

    // Might be better to do this in an immutable way, but it works suprisingly well
    function sortByPreference(string, forms) {
      var counts = preferencesToCounts(string);
      var selectors = _.inject(forms, function(memo, form) {
        memo[formToKey(form)] = form;
        return memo;
      }, {});

      _.forEachRight(toSortedArray(counts), function(counter) {
        var form = selectors[counter[0]];
        if (form) {
          var i = forms.splice(forms.indexOf(form), 1);
          forms.unshift(form);
        }
      });
      return forms;
    }

    function formToKey(form) {
      return form.lemma + LEMMA_POSTAG_DELIMITER + form.postag;
    }

    function getForms() {
      return collectFromStore(self.localStorageKey);
    }

    function getPreferences() {
      return collectFromStore(self.preferenceKey);
    }

    function collectFromStore(keyFragment) {
      return _.inject(arethusaLocalStorage.keys(), function(memo, key) {
        var match = key.match('^' + keyFragment + '.(.*)');
        if (match) {
          memo[match[1]] = arethusaLocalStorage.get(key);
        }
        return memo;
      }, {});
    }
  }
]);
