"use strict";

angular.module('arethusa.comments').service('comments', [
  'state',
  'configurator',
  'navigator',
  'idHandler',
  'notifier',
  function(state, configurator, navigator, idHandler, notifier) {
    var self = this;
    var retriever, persister;
    var idMap;

    this.filter = {};

    this.defaultConf = {
      name: "comments",
      template: "templates/arethusa.comments/comments.html"
    };

    function configure() {
      configurator.getConfAndDelegate('comments', self);
      retriever = configurator.getRetriever(self.conf.retriever);
      persister = retriever;
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

    this.commentCountFor = function(token) {
      return (self.comments[token.id] || []).length;
    };

    function Comment(id, sId, comment, type) {
      function fakeId(sId, id) {
        return '##' + sId + '.' + idHandler.formatId(id, '%w') + '##\n\n';
      }

      this.comment = fakeId(sId, id) + comment;
      this.type = type;
    }

    function saveSuccess(res) {
      notifier.success('Comment created!');
    }

    function saveError() {
      notifier.error('Failed to create comment');
    }

    this.createNewComment = function(id, comment, type) {
      var newComment = new Comment(id, navigator.status.currentId, comment, type);
      persister.saveData(newComment, saveSuccess, saveError);
    };

    this.init = function() {
      configure();
      createIdMap();
      retrieveComments();
    };
  }
]);
