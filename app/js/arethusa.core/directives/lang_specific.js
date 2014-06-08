'use strict';

angular.module('arethusa.core').directive('langSpecific',
  ['documentStore',
  function(documentStore) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        // TODO change first treebank to dynamic value
        scope.lang = documentStore.store.treebank.json.treebank["_xml:lang"];
      }
    };
  }
]);
