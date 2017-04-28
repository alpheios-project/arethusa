'use strict';

describe('BspMorphRetriever', function() {
  var retriever;

  beforeEach(function() {
    module("arethusa.core", function($provide) {
      $provide.value('configurator', arethusaMocks.configurator());
    });

    module("arethusa.morph");

    inject(function(BspMorphRetriever) {
      retriever = new BspMorphRetriever({});
    });
  });

  describe('attributes', function() {

    it('flattens all attributes', function() {
      var infl = [ { "term": 
                   { "lang": "grc",
                     "stem": { "$" : "Μους"},
                     "suff": { "$" : "α"}
                   },
                   "pofs": {
                     "order": 3,
                     "$": "noun"
                    },
                    "decl": { "$":"1st"},
                    "case": {
                        "order": 7,
                        "$": "nominative"
                    },
                    "gend": { "$": "feminine"},
                    "num":  { "$": "singular"},
                    "stemtype": { "$":"a_hs"}
                 }];
      arethusaUtil.toAry(infl).forEach(function (form) {
        retriever.flattenAttributes(form);
        expect(form.pofs).toEqual('noun');
        expect(form.decl).toEqual('1st');
      });
    });
    it('does not fail if attributes are already flat', function() {
      var infl = [ { "term": 
                   { "lang": "grc",
                     "stem": { "$" : "Μους"},
                     "suff": { "$" : "α"}
                   },
                   "pofs": {
                     "order": 3,
                     "$": "noun"
                    },
                    "decl": "1st",
                    "case": {
                        "order": 7,
                        "$": "nominative"
                    },
                    "gend": { "$": "feminine"},
                    "num":  { "$": "singular"},
                    "stemtype": { "$":"a_hs"}
                 }];
      arethusaUtil.toAry(infl).forEach(function (form) {
        retriever.flattenAttributes(form);
        expect(form.pofs).toEqual('noun');
        expect(form.decl).toEqual('1st');
      });
    });
  });
});
