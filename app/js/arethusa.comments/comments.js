"use strict";

angular.module('arethusa.comments').service('comments', [
  'state',
  'configurator',
  'navigator',
  'notifier',
  'plugins',
  function(state, configurator, navigator, notifier, plugins) {
    var self = this;
    var retriever, persister;
    var idMap;
    var commentIndex;
    var fullTextIndex;

    this.filter = {};

    this.defaultConf = {
      name: "comments",
      template: "templates/arethusa.comments/comments.html",
      contextMenu: true,
      contextMenuTemplate: "templates/arethusa.comments/context_menu.html"
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

    function fullText(commentContainer) {
      return arethusaUtil.map(commentContainer.comments, function(el) {
        return el.comment;
      }).join(' ');
    }

    function addToIndex(commentContainer) {
      var ids = commentContainer.ids;
      var id = ids.join('|'); // using a . would interfere with aU.setProperty
      commentIndex[id] = commentContainer;
      fullTextIndex.add({ id: id, body: fullText(commentContainer) });

      angular.forEach(ids, function(tId) {
        arethusaUtil.setProperty(self.reverseIndex, tId + '.' + id, true);
      });
    }

    function lunrIndex() {
      return lunr(function() {
        this.field('body');
        this.ref('id');
      });
    }

    function createIndices() {
      commentIndex = {};
      self.reverseIndex = {};
      fullTextIndex = lunrIndex();
      angular.forEach(self.comments, addToIndex);
    }

    function getFromIndex(ids) {
      return arethusaUtil.map(ids, function(el) {
        return commentIndex[el];
      });
    }

    function selectionFilter() {
      var targets = {};
      angular.forEach(state.selectedTokens, function(token, id) {
        angular.extend(targets, self.reverseIndex[id]);
      });
      return Object.keys(targets).sort();
    }

    function searchText(txt, otherIds) {
      // A former filter returned empty, so we can just return,
      // but it could also be that this fn is the first filter
      // applied.
      if (otherIds && !otherIds.length) return otherIds;

      var hits = fullTextIndex.search(txt);
      var ids = arethusaUtil.map(hits, function(el) { return el.ref; });
      return otherIds ? arethusaUtil.intersect(ids, otherIds) : ids;
    }

    function filteredComments() {
      var sel = self.filter.selection;
      var txt = self.filter.fullText;

      if (sel || txt) {
        var ids;
        if (sel) { ids = selectionFilter(); }
        if (txt) { ids = searchText(txt, ids); }
        return getFromIndex(ids);
      }
    }

    this.currentComments = function() {
      return filteredComments() || self.comments;
    };

    this.commentCountFor = function(token) {
      var count = 0;
      var commentIds = self.reverseIndex[token.id];
      if (commentIds) {
        var idArr = Object.keys(commentIds);
        angular.forEach(getFromIndex(idArr), function(commentObj) {
          count = count + commentObj.comments.length;
        });
      }
      return count;
    };

    function Comment(ids, sId, comment, type) {
      this.ids = ids;
      this.sId = sId;
      this.comment = comment;
    }

    function saveSuccess(fn) {
      return function(commentContainer) {
        // Could be that this chunk had no comments before,
        // so we need to get the just newly created object
        // from the retriever and build up all our indices.
        if (self.comments) {
          addToIndex(commentContainer);
        } else {
          retrieveComments();
        }
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

    this.goToComments = function(tId) {
      state.deselectAll();
      state.selectToken(tId);
      self.filter.selection = true;
      self.filter.fullText = '';
      plugins.setActive(self);
    };

    this.init = function() {
      configure();
      retrieveComments();
    };
  }
]);
