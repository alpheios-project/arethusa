"use strict";

angular.module('arethusa.search').directive('searchByString', [
  'search',
  'state',
  'sidepanel',
  function(search, state, sidepanel) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.search = search;
        scope.state = state;

        // Mind that the following watches aren't active all the time!
        // When it is used from within the search plugins template, and it
        // is inactive through ngIf, they won't fire. This is generally a good
        // thing and we won't delete this code: We can still use it on isolation,
        // or we might at some point display it together with plugins that can
        // edit text.
        // Right now only the artificialToken plugin does this: Both are never
        // shown at the same time, which means this watches actually never fire
        // right now.

        var stringWatches = {};
        function initStringWatch(token, id) {
          var childScope = scope.$new();
          childScope.token = token;
          childScope.$watch('token.string', function(newVal, oldVal) {
            if (newVal !== oldVal) {
              search.removeTokenFromIndex(token.id, oldVal);
              search.collectTokenString(search.strings, id, token);
            }
          });
          stringWatches[id] = childScope;
        }

        function initStringWatches() {
          angular.forEach(state.tokens, initStringWatch);
        }

        function removeStringWatch(scope) {
          scope.$destroy();
        }

        function destroyStringWatch() {
          angular.forEach(stringWatches, removeStringWatch);
          stringWatches = {};
        }

        scope.$watch('state.tokens', function(newVal, oldVal) {
          initStringWatches();
        });

        var inputField = element.find('input')[0];
        var inSidepanel = element.parents('#sidepanel')[0];
        scope.$watch('search.focusStringSearch', function(newVal, oldVal) {
          if (newVal) {
            if (inSidepanel) {
              if (sidepanel.folded) sidepanel.toggle();
            }
            inputField.focus();
            search.focusStringSearch = false;
          }
        });
      },
      templateUrl: 'templates/arethusa.search/search_by_string.html'
    };
  }
]);
