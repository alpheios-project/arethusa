'use strict';
angular.module('arethusa.table').service('table', [
    'state',
    'configurator',
    'navigator',
    'keyCapture',
    'commons',
    'userPreferences',
    'text',
    'morph',
    'relation',
    'inlineComments',
    function (state, configurator, navigator, keyCapture, commons, userPreferences, text, morph, relation, inlineComments) {
        var self = this;
        this.name = "table";

        var props = [
        ];

        function configure() {
            configurator.getConfAndDelegate(self, props);
        }

        this.flattenRelationValues = function() {
            function flatten(obj, acc) {
                for (var key in obj) {
                    acc.push(obj[key]);
                    if (obj[key].nested) {
                        flatten(obj[key].nested, acc)
                    }
                }
                return acc;
            }
            return flatten(relation.relationValues.labels,[]);
        };

        this.text = text;
        this.morph = morph;
        this.state = state;

        this.init = function() {
            configure();
        };
    }
]);
