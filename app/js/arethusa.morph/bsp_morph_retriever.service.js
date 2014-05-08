"use strict";

/* global arethusaUtil */
angular.module('arethusa.morph').service('bspMorphRetriever', function($resource) {
  // Might want to read in language and engine dynamically later
  // also make factory out of it, so that we could use several
  // bsp instances with different settings
  var service = $resource('http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=lat&engine=morpheuslat');

  this.getWord = function(word) {
    return service.get({ 'word': word }).$promise;
  };

  this.getEntryFromResponse = function(res) {
  };

  var deleteUnwantedKeys = function(obj, keys) {
    keys.forEach(function(el) {
      delete obj[el];
    });
  };

  var flattenCaseObject = function(form) {
    var casus = form.case;
    if (casus) {
      form.case = casus.$;
    }
  };

  this.getData = function(string, callback) {
    this.getWord(string).then(function(res) {
      try {
        // The body can contain a single object or an array of objects.
        // Can also be undefined, in that case we will just throw an exception
        // eventually - and we will end up in catch path and just return
        // an empty array.
        var entries = arethusaUtil.toAry(res.RDF.Annotation.Body);
        var results = [];
        return arethusaUtil.inject([], entries, function(results, el) {
          var entry = el.rest.entry;
          var lemma = entry.dict.hdwd.$;
          var lexInvUri = entry.uri;
          // We might have multiple inflections for each entry and need to wrap
          // the array vs. object problem again.
          arethusaUtil.toAry(entry.infl).forEach(function(form) {
            // form is an object with some key/val pairs we have no use for right
            // now - we just ditch them. The rest we take and form another object,
            // which will wrap up the morphological attributes and contain lemma
            // information.
            // There are actually more than these original 3 - we might want to do
            // this differently at some point.
            deleteUnwantedKeys(form, ['term', 'pofs', 'stemtype']);

            // If the form has a case attribute, it wrapped in another object we
            // don't want and need. Flatten it to a plain expression.
            flattenCaseObject(form);

            results.push({
              lexInvUri: lexInvUri,
              lemma: lemma,
              attributes: form
            });
          });
        });
      } catch(err) {
        return [];
      }
    });
    return [];
  };
});
