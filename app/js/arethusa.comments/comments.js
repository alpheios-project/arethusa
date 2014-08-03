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
    var commentIndex;
    var reverseIndex;

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
        createIndices();
      });
    }

    function addToIndex(commentContainer) {
      var ids = commentContainer.ids;
      var id = ids.join('|'); // using a . would interfere with aU.setProperty
      commentIndex[id] = commentContainer;

      angular.forEach(ids, function(tId) {
        arethusaUtil.setProperty(reverseIndex, tId + '.' + id, true);
      });
    }

    function createIndices() {
      commentIndex = {};
      reverseIndex = {};
      angular.forEach(self.comments, addToIndex);
    }

    function selectionFilter() {
      var targets = {};
      angular.forEach(state.selectedTokens, function(token, id) {
        angular.extend(targets, reverseIndex[id]);
      });
      var sorted = Object.keys(targets).sort();
      return arethusaUtil.map(sorted, function(el) {
        return commentIndex[el];
      });
    }

    this.currentComments = function() {
      var res = self.comments;
      if (self.filter.selection) {
        res = selectionFilter();
      }
      return res;
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
