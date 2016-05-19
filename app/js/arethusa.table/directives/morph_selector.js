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

                scope.longForm = function(form) {
                    var longPostag = morph.concatenatedAttributes(form);/*Object.keys(form.attributes).filter(function(k) {
                        return /[A-Za-z0-9]/.test(form.attributes[k]);
                    }).map(function(k) {
                        return morph.longAttributeValue(k,form.attributes[k]);
                    }).join('-');*/
                    var lemma = form.lemma;
                    return lemma + ':' + longPostag;
                };

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
            template: '<select class="no-margin compact" ng-model="form" ng-options="analysis as longForm(analysis) for analysis in analyses" ng-change="onChange()"></select>'
        };
}]);
