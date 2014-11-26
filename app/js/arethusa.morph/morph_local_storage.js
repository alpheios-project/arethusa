"use strict";

angular.module('arethusa.morph').service('morphLocalStorage', [
  'plugins',
  'arethusaLocalStorage',
  function(plugins, arethusaLocalStorage) {
    var self = this;

    this.localStorageKey = 'morph.forms';

    function key(k) {
      return self.localStorageKey + '.' + k;
    }


    function getData(string, callback) {
      var forms = retrieve(string);
      callback(forms);
    }

    function retrieve(string) {
      return arethusaLocalStorage.get(key(string)) || [];
    }

    function persist(string, value) {
      arethusaLocalStorage.set(key(string), value);
    }

    this.retriever = {
      getData: getData,
      abort: function() {}
    };

    this.addForm = function(string, form) {
      // Check if we already stored info about this word,
      // if not add a need array to the store
      var forms = retrieve(string) || [];

      // Store a copy and set the selected property to false!
      var newForm = angular.copy(form);
      newForm.selected = false;
      forms.push(newForm);
      persist(string, forms);
    };

    this.removeForm = function(string, form) {
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
    };
  }
]);
