'use strict';
angular.module('arethusa.inlineComments').service('inlineComments', [
    'state',
    'configurator',
    'userPreferences',
    function (state, configurator, userPreferences) {
        var self = this;
        this.name = "inlineComments";

        var props = [
        ];

        function configure() {
            configurator.getConfAndDelegate(self, props);
        }

        this.init = function() {
            configure();
        };
    }
]);