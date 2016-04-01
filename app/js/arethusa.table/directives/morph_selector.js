'use strict';
angular.module('arethusa.table').directive('morphSelector',[
    'state',
    'morph',
    function (state, morph) {
        return {
            restrict: 'A',
            scope: {
                token: "=morphToken"
            },
            link: function(scope, element, attrs) {
                scope.analyses = morph.analyses[scope.token.id].forms;
                scope.form = scope.token.morphology;

                function undoFn(tkn, frm) {
                    var token = tkn;
                    var form = frm;
                    return function() {
                        scope.form = form;
                        state.change(token.id,'morphology',form);
                    };
                }

                function preExecFn(frm) {
                    var form = frm;
                    return function() {
                        scope.form = form;
                    };
                }
                
                scope.onChange = function() {
                    state.change(scope.token.id, 'morphology', scope.form, undoFn(scope.token,scope.token.morphology), preExecFn(scope.form));
                };

            },
            template: '<select ng-model="form" ng-options="analysis as analysis.lemma+\':\'+analysis.postag for analysis in analyses" ng-change="onChange()"></select>'
        };
}]);
