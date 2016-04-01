'use strict';
angular.module('arethusa.table').service('table', [
    'state',
    'configurator',
    'navigator',
    'keyCapture',
    'commons',
    'userPreferences',
    'morph',
    function (state, configurator, navigator, keyCapture, commons, userPreferences, morph) {
        var self = this;
        this.name = "table";

        var props = [
        ];

        function configure() {
            configurator.getConfAndDelegate(self, props);
        }

        this.getTokens = function() {
            return state.tokens;
        };

        this.getAnalyses = function(id) {
            return morph.analyses[id];
        };

        this.init = function() {
            configure();
        };
    }
]);
