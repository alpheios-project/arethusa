'use strict';

describe('table', function() {

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

    var table, state, morph;
    
    beforeEach( function() {

        module("arethusa.core", function($provide) {
            var custom = { getConfAndDelegate: morphConf };
            $provide.value('configurator', arethusaMocks.configurator(custom));
            $provide.value('plugins', arethusaMocks.plugins());
        });

        module("arethusa.morph");
        module("arethusa.table");

        inject(function(_state_, _morph_, _table_) {
            state = _state_;
            state.initServices();
            state.replaceState(arethusaMocks.tokens());
            morph = _morph_;
            morph.init();
            table = _table_;
            table.init();
        });
    });

    it('succeds to load the plugin', function() {
        expect(table).toBeDefined();
    })

    describe('this.getTokens', function() {
        var tokens, token;

        beforeEach(function() {
            tokens = table.getTokens();
            token = tokens['02'];
        })

        it('returns the state\'s tokens', function() {
            expect(tokens).toEqual(state.tokens);
        });

        xit('fully loaded with head, relation and morphology properties', function() {
            expect(token).toBeDefined();
            expect(token.head).toBeDefined();
            expect(token.relation).toBeDefined();
            expect(token.morphology).toBeDefined();
        });

    });

    describe('this.getAnalyses', function() {
        it('returns the morph plugin\'s analyses for a given token ID', function() {
            expect(table.getAnalyses('02')).toEqual(morph.analyses['02']);
        });
    });
});