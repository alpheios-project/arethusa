"use strict";

angular.module('arethusa.comments').service('comments', [
  'state',
  'configurator',
  'navigator',
  'notifier',
  function(state, configurator, navigator, notifier) {
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
      self.comments = [];
      retriever.getData(navigator.status.currentId, function(comments) {
        self.comments = comments;
      });
    }

    this.currentComments = function() {
      //return arethusaUtil.inject({}, self.comments, function(memo, id, comment) {
        //var add = true;
        //if (!(self.filter.selection && !state.isSelected(id))) {
          //memo[id] = comment;
        //}
      //});
      return self.comments;
    };

    this.commentCountFor = function(token) {
      return (self.comments[token.id] || []).length;
    };

    function Comment(ids, sId, comment, type) {
      this.ids = ids;
      this.sId = sId;
      this.comment = comment;
    }

    function saveSuccess(fn) {
      return function() {
        fn();
        notifier.success('Comment created!');
      };
    }

    function saveError() {
      notifier.error('Failed to create comment');
    }

    this.createNewComment = function(ids, comment, successFn) {
      var newComment = new Comment(ids, navigator.status.currentId, comment);
      persister.saveData(newComment, saveSuccess(successFn), saveError);
    };

    this.init = function() {
      configure();
      retrieveComments();
    };
  }
]);
