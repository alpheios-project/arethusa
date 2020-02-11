"use strict";

angular.module('arethusa.core').factory('apiOutputter', [
  function (uuid2) {
    return function (uuid2) {
      var self = this;

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
        // TODO Decide whether or not to bother with the whole OAC Annotation Wrapper or not
        var resp = { 
          RDF: { 
            Annotation: { 
              about: "urn:uuid:" + uuid2.newuuid(),
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
            entry.infl = this._attributesToAlpheios(infl.attributes,morph)
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
              resource: "cnt:ContentAsXML"
            },
            rest: { entry: entry } 
          }
        }
        return resp
      };
    };
  }
]);


