"use strict";

/**
 * @ngdoc service
 * @name arethusa.morph.morph_local_storage
 *
 * @description
 * Manages local storage of a user's morphological forms
 * and preferences 
 *
 *
 * @requires arethusa.core.local_storage
 * @requires arethusa.core.plugins
 * @requires lodash.underscore
 */

angular.module('arethusa.morph').service('morphLocalStorage', [
  'plugins',
  'arethusaLocalStorage',
  '_',
  function(plugins, arethusaLocalStorage, _) {
    var MAX_PREFS_VERSION = '1';
    var MIN_PREFS_VERSION = '1';
    var CURRENT_PREFS_VERSION = '1';
    var VERSION_DELIMITER = '$$';
    var PREFERENCE_DELIMITER = ';;';
    var PREFERENCE_COUNT_DELIMITER = '@@';
    var LEMMA_POSTAG_DELIMITER = '|-|';
    var self = this;

    this.localStorageKey = 'morph.forms';
    this.preferenceKey = 'morph.prefs';

    this.delimiters = {
      preference: PREFERENCE_DELIMITER,
      count: PREFERENCE_COUNT_DELIMITER,
      lemmaToPostag: LEMMA_POSTAG_DELIMITER,
      version: VERSION_DELIMITER
    };

    /**
     * @ngdoc property
     * @name arethusa.morph.morph_local_storage.retriever
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Encaspulated Arethusa Retriever Implementation
     *
     */
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
    this.readPreference = readPreference;

    // formats a key for local storage of forms
    function key(k) {
      return self.localStorageKey + '.' + k;
    }

    // formats a key for local storage of preferences
    function preferenceKey(k) {
      return self.preferenceKey + '.' + k;
    }


    // required method of an Arethusa retriever
    // executes callback after retrieving the data
    // requested by the string
    // only used to retrieve form data not preference
    // data
    function getData(string, callback) {
      var forms = retrieve(string);
      callback(forms);
    }

    // retrieve form data from local storage
    function retrieve(string) {
      return arethusaLocalStorage.get(key(string)) || [];
    }

    // retrieve preference data from local storage
    function retrievePreference(string) {
      return arethusaLocalStorage.get(preferenceKey(string)) || '';
    }

    // persist form data to local storage
    function persist(string, value) {
      arethusaLocalStorage.set(key(string), value);
    }

    // persist form preference data to local storage
    function persistPreference(string, value) {
      var versionedValue = CURRENT_PREFS_VERSION + VERSION_DELIMITER + value;
      return arethusaLocalStorage.set(preferenceKey(string), versionedValue);

    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.addForm
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Adds a new morphological form to local storage
     *
     * @param {String} string the form as a string
     * @param {Object} form the morphological form properties 
     *
     * @returns {int} the number of forms added (1 or 0)
     */
    function addForm(string, form) {
      // Check if we already stored info about this word,
      // if not add a need array to the store
      var forms = retrieve(string) || [];

      // Store a copy and set the selected property to false!
      if (isValidForm(form)) {
        var newForm = angular.copy(form);
        newForm.selected = false;
        forms.push(newForm);
        persist(string, forms);
        return 1;
      } else {
        return 0;
      }
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.addForms
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Adds a set of morphological forms to local storage
     *
     * @param {String} string the form as a string
     * @param {Array} forms a list of objects containing
     *                the morphological form properties 
     *
     * @returns {int} the number of forms added
     */
    function addForms(string, newForms) {
      var forms = retrieve(string) || [];
      var added = 0;
      var keys = _.map(forms, formToKey);
      _.forEach(newForms, function(form) {
        if (isValidForm(form) && !_.contains(keys, formToKey(form))) {
          forms.push(form);
          added++;
        }
      });
      persist(string, forms);
      return added;
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.removeForm
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Removes a form from local storage
     *
     * @param {String} string the form as a string
     * @param {Object} form morphological properties
     *                 to remove
     *
     */
    function removeForm(string, form) {
      var forms = retrieve(string);
      if (forms) {
        // find element and remove it, when it's present
        var stored = aU.find(forms, function (otherForm) {
          // @balmas this is a little weird -- the comparator
          // is set in arethusa.morph.configure - not sure
          // if this was intentional to make it possible for
          // the calling code to be able to use its own comparator
          // or if it was because we don't have a formal 
          // class to hold a form and its functions
          return self.comparator(form, otherForm);
        });
        if (stored) {
          forms.splice(forms.indexOf(stored), 1);
        }
        persist(string, forms);
      }
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.addPreference
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Adds a user's selection of a given form to the
     * history of their selections of that form, or if it
     * is already there, increments the frequency count
     *
     * @param {String} string the form as a string
     * @param {Object} form the selected morphological properties
     * @param {int} additor Optional - an amount to increment by 
     *             (if more than the default count of 1)
     *
     * @return {int} the number of preferences added
     */
    function addPreference(string, form, additor) {
      additor = parseInt(additor) || 1;
      if (isValidForm(form)) {
        var key = formToKey(form);
        var counts = preferencesToCounts(string);
        var counter = counts[key];
        var newCount = counter ? counter + additor : additor;
        counts[key] = newCount;
        var sortedCounts = toSortedArray(counts);
        var toStore = _.map(sortedCounts, function(countArr) {
          return countArr[0] + PREFERENCE_COUNT_DELIMITER + countArr[1];
        }).join(PREFERENCE_DELIMITER);
        persistPreference(string, toStore);
        return 1;
      } else {
        return 0;
      }
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.addPreferences
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Adds a precomposed set of frequency data for a form
     * to local storage. Currently used when importing data
     * from an external source (such as a downloaded backup).
     *
     * @param {String} string the form as a string
     * @param {String} frequencies the frequency data formatted per requirements
     *                  
     */
    function addPreferences(string, frequencies) {
      var data = readPreference(frequencies);
      _.forEach(data, function(datum) {
        addPreference(string, datum.form, datum.count);
      });
      return data.length;
    }

    // Sorts frequency data for a form by the counts (most counts first)
    // takes as input an object which maps the morphology properties (string form)
    // to the frequency count (as produced by preferencesToCounts)
    function toSortedArray(counts) {
      return _.map(counts, function(v, k) {
        return [k, v];
      }).sort(function(a, b) {
        return b[1] - a[1];
      });
    }

    // maps morphology properties (string form) to the frequency count
    function preferencesToCounts(string) {
      var prefs = readPreference(retrievePreference(string));
      return _.inject(_.filter(prefs), function(memo, pref) {
        memo[formToKey(pref.form)] = parseInt(pref.count);
        return memo;
      }, {});
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.sortByPreference
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Returns user's prior selections of the supplied forms
     * sorted according to the frequency with which those 
     * forms were previously selected by the user
     *
     * @param {String} string the form as a string
     * @param {Array} forms a list of forms to check for the supplied
     *                string
     *
     * @return {Array} the supplied forms resorted by frequency
     */
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

    // forms morphological properties as a string for storage
    // in the format <lemma>|-|<postag>
    function formToKey(form) {
      return form.lemma + LEMMA_POSTAG_DELIMITER + form.postag;
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.getForms
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Retrieves user-created forms from local storage
     *
     * @return {Object} the user-created forms
     */
    function getForms() {
      return collectFromStore(self.localStorageKey);
    }

    /**
     * @ngdoc function
     * @name arethusa.morph.morph_local_storage.gepreferences
     * @methodOf arethusa.morph.morph_local_storage
     *
     * @description
     * Retrieves user's form frequency selections from
     * local storage
     *
     * @return {Object} the user form frequency data
     */
    function getPreferences() {
      return collectFromStore(self.preferenceKey);
    }

    // retrieves morphological  data from local
    // storage - looks for all data which starts with the preference
    // key (morph.prefs. or morph.forms.) and returns them in an object 
    // mapping the form string to data (preferences or forms)
    function collectFromStore(keyFragment) {
      return _.inject(arethusaLocalStorage.keys(), function(memo, key) {
        var match = key.match('^' + keyFragment + '.(.*)');
        if (match) {
          memo[match[1]] = arethusaLocalStorage.get(key);
        }
        return memo;
      }, {});
    }

    // checks to see if the preference version is supported
    function prefVersionIsSupported(ver) {
      return ver >= MIN_PREFS_VERSION && ver <= MAX_PREFS_VERSION;
    }

    // reads a preference string and converts it into its internal
    // representation - will ignore invalid strings or those with
    // an unsupported version 
    function readPreference(prefString) {
      var prefs,version;
      var validPrefs = [];
      var parts = prefString.split(VERSION_DELIMITER);
      if (parts.length == 2) {
          version = parts[0];
          prefs = parts[1].split(PREFERENCE_DELIMITER);
      }
      if (prefVersionIsSupported(version)) {
        for (var i=0; i<prefs.length; i++) {
          var formAndCount = prefs[i].split(PREFERENCE_COUNT_DELIMITER);
          if (formAndCount.length == 2) {
            var count = parseInt(formAndCount[1]);
            var lemmaAndPostag = formAndCount[0].split(LEMMA_POSTAG_DELIMITER);
            if (lemmaAndPostag.length == 2) {
              var lemma = lemmaAndPostag[0];
              var postag  = lemmaAndPostag[1];
              validPrefs.push({ 'form' : { 'lemma': lemma, 'postag': postag }, 'count' :count });
            }
          }
        }
      }
      return validPrefs;    
    }

    // checks to see that the supplied object is a valid, preservable morph form
    function isValidForm(form) {
      return form.lemma && form.postag && typeof form.lemma === 'string' && typeof form.postag === 'string';
    }
  }
]);
