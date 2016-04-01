'use strict';

describe('inlineComments', function() {

    function morphConf(obj) {
        obj.attributes = {
            "pos" : {
                "long" : "Part of Speech",
                "short" : "pos",
                "values" : {
                    "noun" : {
                        "long" : "noun",
                        "short" : "noun",
                        "postag" : "n",
                        "style" : {
                            "color" : "black"
                        }
                    },
                    "adj" : {
                        "long" : "adjective",
                        "short" : "adj",
                        "postag" : "a",
                        "style" : {
                            "color" : "blue"
                        }
                    }
                }
            },
            "pers" : {
                "long" : "Person",
                "short" : "pers",
                "values" : {
                    "1st" : {
                        "long" : "first person",
                        "short" : "1st",
                        "postag" : "1",
                        "style" : {
                            "text-decoration": "underline"
                        }
                    },
                    "2nd" : {
                        "long" : "second person",
                        "short" : "2nd",
                        "postag" : "2"
                    }
                }
            }
        };
        obj.postagSchema = ['pos', 'pers'];
        obj.conf = {};
    }

    var inlineComments;

    beforeEach( function() {

        module("arethusa.core", function($provide) {
            var custom = { getConfAndDelegate: morphConf };
            $provide.value('configurator', arethusaMocks.configurator(custom));
            $provide.value('plugins', arethusaMocks.plugins());
        });

        module("arethusa.inlineComments");

        inject(function(_inlineComments_) {
            inlineComments = _inlineComments_;
            inlineComments.init();
        });
    });

    it('succeds to load the plugin', function() {
        expect(inlineComments).toBeDefined();
    })
});