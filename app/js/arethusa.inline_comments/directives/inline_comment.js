"use strict";

angular.module('arethusa.inlineComments').directive('inlineComment', [
    'state',
    function(state) {
        return {
            restrict: 'A',
            scope: {
                token:"=commentToken"
            },
            link: function(scope, element, attrs) {
                scope.comment = scope.token.comment? scope.token.comment : '';

                //TODO: undo function
                // - set state to previous value
                // - set scope.comment to previous value
                // - how does redo work?

                function undoFn(tkn, cmt) {
                    var token = tkn;
                    var comment = cmt;
                    return function() {
                        scope.comment = comment;
                        state.change(token,'comment',comment)
                    }
                }

                function preExecFn(cmt) {
                    var comment = cmt;
                    return function() {
                        scope.comment = comment;
                    }
                }

                scope.updateState = function() {
                    state.change(scope.token,'comment',scope.comment,undoFn(scope.token,scope.token.comment),preExecFn(scope.comment));
                };
            },
            templateUrl: 'js/arethusa.inline_comments/templates/inline_comment.html'
        };
    }
]);
