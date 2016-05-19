'use strict';
angular.module('arethusa.table').service('table', [
    '$rootScope',
    '$modal',
    'state',
    'configurator',
    'navigator',
    'keyCapture',
    'commons',
    'userPreferences',
    'morph',
    function ($rootScope, $modal, state, configurator, navigator, keyCapture, commons, userPreferences, morph) {
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

        this.openCreate = function(id) {
            $rootScope.morphcreateform = {id:id,token:self.getAnalyses(id)};
            $modal.open({
                template: "<morph-form-create morph-token='$root.morphcreateform.token' morph-id='$root.morphcreateform.id'></morph-form-create>"
            });
        };

        this.init = function() {
            configure();
        };
    }
]);
