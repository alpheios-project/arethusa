"use strict";

angular.module('arethusa.comments').service('comments', [
  'state',
  'configurator',
  'navigator',
  'idHandler',
  function(state, configurator, navigator, idHandler) {
    var self = this;
    var retriever;
    var idMap;

    this.filter = {};

    this.defaultConf = {
      name: "comments",
      template: "templates/arethusa.comments/comments.html"
    };

    function configure() {
      configurator.getConfAndDelegate('comments', self);
      retriever = configurator.getRetriever(self.conf.retriever);
    }

    configure();

    function retrieveComments() {
      self.comments = {};
      retriever.getData(navigator.status.currentId, function(comments) {
        angular.extend(self.comments, withMappedIds(comments));
      });
    }

    function withMappedIds(comments) {
      return arethusaUtil.inject({}, comments, function(memo, id, comment) {
        memo[idMap[id]] = comment;
      });
    }

    function createIdMap() {
      idMap = idHandler.sourceIdMap(state.tokens, 'treebank');
    }

    this.currentComments = function() {
      return arethusaUtil.inject({}, self.comments, function(memo, id, comment) {
        var add = true;
        if (!(self.filter.selection && !state.isSelected(id))) {
          memo[id] = comment;
        }
      });
    };

    this.init = function() {
      configure();
      createIdMap();
      retrieveComments();
    };
  }
]);
