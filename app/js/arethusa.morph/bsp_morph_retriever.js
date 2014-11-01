'use strict';
/* A newable factory to handle the Morphology service
 *
 * The constructor functions takes a configuration object (that typically
 * contains a resource object for this service).
 *
 */
angular.module('arethusa.morph').factory('BspMorphRetriever', [
  'configurator',
  function (configurator) {
    function deleteUnwantedKeys(obj, keys) {
      keys.forEach(function (el) {
        delete obj[el];
      });
    }

    function flattenAttributes(form, toFlatten) {
      toFlatten.forEach(function (el) {
        var attr = form[el];
        if (attr) {
          form[el] = attr.$;
        }
      });
    }

    function renameAttributes(form, mappings) {
      if (!mappings) return;
      for (var oldName in mappings) {
        var newName = mappings[oldName];
        var val = form[oldName];
        delete form[oldName];
        form[newName] = val;
      }
    }

    function renameValues(form, mappings) {
      if (!mappings) return;
      for (var category in mappings) {
        var val = form[category];
        var actions = mappings[category];
        var actual = actions[val];
        if (actual) {
          form[category] = actual;
        }
      }
    }

    function formatLexInvData(uri) {
      if (uri) {
        return {
          uri: uri,
          urn: uri.slice(uri.indexOf('urn:'))
        };
      }
    }

    function isPunctuation(str) {
      return str.match(/[\.;?!:·]/);
    }

    function isComma(str) {
      return str === ',';
    }

    function punctuation(lemma) {
      return [{
        lemma: lemma,
        attributes: { pos: 'punctuation' },
        origin: 'bsp/morpheus'
      }];
    }

    return function (conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      this.getWord = function (word) {
        return resource.get({ 'word': word });
      };

      this.abort = resource.abort;

      this.getData = function (string, callback) {
        if (isPunctuation(string)) return callback(punctuation('punc'));
        if (isComma(string))       return callback(punctuation('comma'));

        self.getWord(string).then(function (res) {
          try {
            // The body can contain a single object or an array of objects.
            // Can also be undefined, in that case we will just throw an exception
            // eventually - and we will end up in catch path and just return
            // an empty array.
            var entries = arethusaUtil.toAry(res.data.RDF.Annotation.Body);
            var results = arethusaUtil.inject([], entries, function (results, el) {
              var entry = el.rest.entry;
              var lemma = entry.dict.hdwd.$;
              // We might have multiple inflections for each entry and need to wrap
              // the array vs. object problem again.
              arethusaUtil.toAry(entry.infl).forEach(function (form) {
                // form is an object with some key/val pairs we have no use for right
                // now - we just ditch them. The rest we take and form another object,
                // which will wrap up the morphological attributes and contain lemma
                // information.
                // There are actually more than these original 3 - we might want to do
                // this differently at some point.
                deleteUnwantedKeys(form, [
                  'term',
                  'stemtype'
                ]);
                // If the form has a case attribute, it wrapped in another object we
                // don't want and need. Flatten it to a plain expression.
                // The same goes for part of speech.
                flattenAttributes(form, [
                  'case',
                  'pofs'
                ]);
                renameAttributes(form, self.mapping.attributes);
                renameValues(form, self.mapping.values);

                results.push({
                  lexInvLocation: formatLexInvData(entry.uri),
                  lemma: lemma,
                  attributes: form,
                  origin: 'bsp/morpheus'
                });
              });
            });
            callback(results);
          } catch (err) {
            return [];
          }
        });
        return [];
      };
    };
  }
]);
