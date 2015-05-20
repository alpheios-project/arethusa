"use strict";

angular.module('arethusa').factory('SnapdrgnRetriever', [
  'configurator',
  'commons',
  'documentStore',
  'editors',
  'idHandler',
  'retrieverHelper',
  function(configurator, commons, documentStore, editors, idHandler, retrieverHelper) {

      var capitalize = function(string) {
          return string.charAt(0).toUpperCase() + string.slice(1);
      }
      var PerseusNameMatcher = new RegExp("^http://data\.perseus\.org/people/smith:([a-zA-Z]+)")
      
      /**
       * Return a parsed document
       * @param  {Array}  json  [description]
       * @param  {[type]} docId [description]
       * @return {[type]}       [description]
       */
      function parseDocument(json, docId) {
        var annotators = findAnnotators(json); //because we can have group, we need to flatten this
        parseEditors(annotators, docId);
        var sentences = arethusaUtil.toAry(json);
        return parseAnnoToSentences(sentences, docId);
      };


      /**
       * Parse a list of annotations into one sentence
       * @param  {[type]} annotations [description]
       * @param  {[type]} docId     [description]
       * @return {[type]}           [description]
       */
      function parseAnnoToSentences(annotations, docId) {
        // Warning ! For now, the sentenceId and docId are the same !
        // No cite informations for now !
        return [parseAnnoToSentence(annotations, docId+"-1", docId, "urn:cite:perseus:network.1.2")];
      }

      function annoToPersons(annotations) {
        var persons = {};
        angular.forEach(annotations, function(annotation, index) {
            var bonds = {};
            //For each annotation, we have a source !
            var targetPage = annotation["hasTarget"]["hasSource"]["@id"];

            // We have a body
            //The body has two elements normally, one being the source of the bond, the other
            
            angular.forEach(annotation.hasBody["@graph"], function(body, subindex){
                //If we have the source of the bond
                if("snap:has-bond" in body) {
                    var id = body["@id"].toLowerCase(),
                        bondId = body["snap:has-bond"]["@id"],
                        direction = "source",
                        type = false;
                //If we have the direction of the bond
                } else if ("snap:bond-with" in body) {
                    var id = body["snap:bond-with"]["@id"].toLowerCase(),
                        bondId = body["@id"],
                        direction = "target",
                        type = body["@type"];
                } else {
                    return;
                }
                if(!(bondId in bonds)) {
                    bonds[bondId] = {
                        source : null,
                        target : null
                    }
                }
                bonds[bondId][direction] = {
                    id : id,
                    name : capitalize(id.match(PerseusNameMatcher)[1])
                };
                if(type !== false) {
                    bonds[bondId].type = type;
                    bonds[bondId].id = bondId;
                }
            });
          //  Normaly, there should be only one bond, but just in case...
          angular.forEach(bonds, function(bond, bondId) {
              // !!!! Temp fix 
              // Right now, the target is always what is recognized as the person
              // Through, this should not be the case, we should have a way to tell what represents 
              //  really the selected text
              var realTarget = bond.target.id,
                  otherTarget = bond.source.id;

              // Now we register found bounds !
              if (typeof persons[bond.target.id] === "undefined") {
                persons[bond.target.id] = bond.target;
              }
              if (typeof persons[bond.source.id] === "undefined") {
                persons[bond.source.id] = bond.source;
              }
              var edge = {
                  type : bond.type,
                  id : bond.id.replace(/([\.\[\]\(\)\#\/:])/g,"\\$1"),
                  target : realTarget,
                  source : otherTarget,
                  weight: 1,
                  group: 0,
                  graph : [{
                    source : bond.id,
                    target : targetPage,
                    selector : annotation["hasTarget"]["hasSelector"],
                    type : "attestation"
                  }]
              };
              if(typeof persons[realTarget].graph === "undefined") {
                persons[realTarget].graph = [];
              }
              persons[realTarget].graph.push(edge);
          });
        });
       
        return persons;
      }

      function parseAnnoToSentence(annotations, sentenceId, docId, cite) {
        var persons = annoToPersons(annotations);
        var tokens = {};

        var lastI = persons.length - 1;
        angular.forEach(persons, function(person, i) {
          var token = personToToken(person, sentenceId, docId, {});
          if (i === lastI) token.terminator = true;
          tokens[token.id] = token;
        });

        var sentenceObj = commons.sentence(tokens, cite);
        retrieverHelper.generateId(sentenceObj, sentenceId, docId, docId);

        return sentenceObj;
      }

      var personGraphToToken = function(person, sentenceId) {
        var graph = person.graph;
        //Now we need to update the graph with the id
        angular.forEach(graph, function(link, linkId) {
          //idHandler.getId(headId, sentenceId)
          graph[linkId].source = idHandler.getId(link.source, sentenceId);
          graph[linkId].target = idHandler.getId(link.target, sentenceId);

          /*
          angular.forEach(link.graph, function(sublink, sublinkId) {

          });
          */
        });
        this.graph = graph;
      }

      var personToToken = function(person, sentenceId, docId, artificials) {
        var token = commons.token(person.name, sentenceId);

        personGraphToToken.call(token, person, sentenceId);

        var internalId = generateInternalId(person, sentenceId);
        var sourceId   = person.id;
        retrieverHelper.generateId(token, internalId, sourceId, docId);


        return token;
      }

      var padWithSentenceId = function (id, sentenceId) {
        return (id.match(/-/)) ? id : idHandler.padIdWithSId(id, sentenceId);
      }
      var generateInternalId = function (word, sentenceId) {
        if (word.artificial) {
          return padWithSentenceId(word.id, sentenceId);
        } else {
          return idHandler.getId(word.id, sentenceId);
        }
      }

      /**
       * Return an array of identified annotators
       * @param  {Array}    json List of open annotations
       * @return {Array}         Array of identified annotators
       */
      var findAnnotators = function(json) {
        var authors = [];
        angular.forEach(json, function(annotation, i) {
          if(annotation.annotatedBy["@type"] === "foaf:group") {
            authors = arethusaUtil.flatten(authors.push(annotation.annotatedBy["foaf:member"]));
          } else {
            authors.push(annotation.annotatedBy)
          }
        });
        return authors;
      };

      /**
       * Check that the given object represents a person
       * @param  {Object}  annotator [description]
       * @return {Boolean}           [description]
       */
      var isHumanAnnotator = function(annotator) {
        return (annotator["@type"] === "foaf:Person")
      }

      /**
       * Parse the editors informations
       * @param  {[type]} annotators [description]
       * @param  {[type]} docId      [description]
       * @return {[type]}            [description]
       */
      var parseEditors = function(annotators, docId) {
        angular.forEach(annotators, function(annotator, i) {
          if (isHumanAnnotator(annotator)) {
            editors.addEditor(docId, {
              name: annotator["foaf:name"],
              fullName: annotator["foaf:name"],
              page: undefined,
              mail: undefined
            });
          }
        });
      };

      /**
       * Return the path to the list of annotations
       * @param {Object} json Json object
       */
      var SnapToArethusa = function(json) {
        return json.persons;
      };

    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);
      var docId = conf.docIdentifier;

      this.parse = function(json, callback) {
        var arethusaJson = SnapToArethusa(json);
        var parsedDoc = parseDocument(arethusaJson, docId);
        var doc = commons.doc(undefined, arethusaJson);

        documentStore.addDocument(docId, doc);
        callback(parsedDoc);
      };

      this.get = function (params, callback) {
        if (!callback) {
          callback = params;
          params = {};
        }
        //Params are not given, don't know what going on. See with @LFDM and @BALMAS
        resource.get(params).then(function(res) {
          var data = res.data;
          self.parse(data, callback);
        });
      };
    };
  }
]);
