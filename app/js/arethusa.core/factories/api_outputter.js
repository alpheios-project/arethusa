"use strict";

angular.module('arethusa.core').factory('apiOutputter', [
  function (uuid2) {
    return function (uuid2) {
      var self = this;

      // this is essentially just the reverse of the mapping
      // that can be found in the various morph attributes
      // config files. Ideally we would delegate back to a 
      // config file which defines Arethusa internal to 
      // Alpheios external lexicon format but for now 
      // since we currently only support one api output format we can 
      // just hard code it
      this._attributesToAlpheios = function(attributes,morph) {
        var infl = {}
        angular.forEach(attributes, function (value, key) {
          value = morph.longAttributeValue(key,value)
          if (key === 'pos') {
            key = 'pofs'
            if (value === 'verb' && attributes.mood === 'participle') {
              value = 'verb participle'
            } else if (value === 'adposition') {
              value = 'preposition'
            }
          } 
          if (key === 'degree') {
            key = 'comp'
          } 
          if (key === 'tense' && value ==='plusquamperfect') {
              value = 'pluperfect'
          }
          if (key === 'voice'  && value ==='medio-passive') {
            value = 'mediopassive'
          }
          infl[key] = { $ : value }
        });
        return infl
      }

      this.outputMorph = function (token,lang,morph) {
        // if we were to follow the Arethusa design more 
        // closely, this would be handled via a BSPMorphPersister
        // but it's easier to just do it here for now
        var resp = { 
          RDF: { 
            Annotation: { 
              about: "urn:uuid:" + uuid2.newuuid(),
              // TODO we should fill in the creator, created, rights and target info
              creator: {
                Agent: { 
                  about: ""
                }
              },
              created: { 
                $: ""
              },
              rights: {
                $: ""
              },
              hasTarget: {
                Description: {
                  about: ""
                }
              }
            } 
          } 
        }
        var infl = token.morphology
        if (infl) {
          var entry = {}
          var uuid = "urn:uuid:" + uuid2.newuuid()
          if (angular.isDefined(infl.lemma)) { 
            entry.dict = { hdwd: { lang: lang, $: infl.lemma } }
          }
          if (angular.isDefined(infl.postag)) {
            entry.infl = this._attributesToAlpheios(infl.attributes,morph);
            entry.infl.term = { form: { $: token.string } };
          }
          var glosses = []
          if (angular.isDefined(infl.gloss)) {
            glosses.push({ $: infl.gloss})
          }
          if (angular.isDefined(infl.alternateGloss)) { 
            glosses.push({ $: infl.alternateGloss})
          }
          if (glosses.length > 1) {
            entry.mean = glosses
          } else if (glosses.length == 1) {
            entry.mean = glosses[0]
          }
          if (angular.isDefined(infl.notes)) { 
            entry.note = { $: infl.notes }
          }
          resp.RDF.Annotation.hasBody = {
            resource: uuid,
          }
          resp.RDF.Annotation.Body = { 
            about: uuid,
            type: { 
              resource: "cnt:ContentAsXML" // this is not technically correct but this is legacy code
            },
            rest: { entry: entry } 
          }
        }
        return resp
      };
    };
  }
]);


