"use strict";

angular.module('arethusa.oa').service('oaHandler', [
  'uriGenerator',
  'state',
  'documentStore',
  function(uriGenerator, state, documentStore) {
    var self = this;

    this.generateTarget = function(ids) {
      return arethusaUtil.inject([], ids, function(memo, id) {
        memo.push(state.asString(id));
      }).join(':');
    };
  }
]);
