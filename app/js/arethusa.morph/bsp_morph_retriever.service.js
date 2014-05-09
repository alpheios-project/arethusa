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

  var flattenAttributes= function(form, toFlatten) {
    toFlatten.forEach(function(el) {
      var attr = form[el];
      if (attr) {
        form[el] = attr.$;
      }
    });
  };

  var renameAttributes = function(form, renamers) {
    for (var oldName in renamers) {
      var newName = renamers[oldName];
      var val = form[oldName];
      delete form[oldName];
      form[newName] = val;
    }
  };

  var renameValues = function(form, renamers) {
    for (var key in renamers) {
      var val = form[key];
      var naming = renamers[key];
      if (val === naming[0]) {
        form[key] = naming[1];
      }
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
        var results = arethusaUtil.inject([], entries, function(results, el) {
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
            deleteUnwantedKeys(form, ['term', 'stemtype']);

            // If the form has a case attribute, it wrapped in another object we
            // don't want and need. Flatten it to a plain expression.
            // The same goes for part of speech.
            flattenAttributes(form, ['case', 'pofs']);

            // These renaming stuff could probably be configurable...
            renameAttributes(form, {'pofs': 'pos'});
            renameValues(form, { 'pos' : ['verb\nparticiple', 'participle']});

            results.push({
              lexInvUri: lexInvUri,
              lemma: lemma,
              attributes: form,
              origin: 'bsp/morpheus'
            });
          });
        });
        callback(results);
      } catch(err) {
        return [];
      }
    });
    return [];
  };
});
