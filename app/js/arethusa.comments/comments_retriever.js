"use strict";

angular.module('arethusa.comments').factory('CommentsRetriever', [
  'configurator',
  'idHandler',
  'state',
  function(configurator, idHandler, state) {
    var comments = { document: [] };
    var alreadyLoaded;

    function splitIdAndComment(comment) {
      var i = lastIndexOfHeaderSection(comment);
      var header = comment.slice(0, i - 1);
      var comm   = comment.slice(i);
      var regexp = new RegExp('^##(.*?)##');
      var match = regexp.exec(header);
      return match ? [match[1], comm] : [null, comment];
    }

    function lastIndexOfHeaderSection(comment) {
      var i = comment.indexOf('#!#\n\n');
      // Backwards compabitilty for comments that didn't
      // have the token strings attached
      return i === -1 ? comment.indexOf('##\n\n') + 4 : i + 5;
    }

    function WrappedComment(ids, comment) {
      this.ids = ids;
      this.comments = [comment];
    }

    function addComments(id, comment) {
      // We might be provided with document level comments, that come
      // without token identifiers.
      if (!id) return comments.document.push(comment);

      var sentenceIdAndWIds = id.split('.');

      var sentenceId  = sentenceIdAndWIds[0];
      var wIds = arethusaUtil.map(sentenceIdAndWIds[1].split(','), function(id) {
        return idHandler.getId(id, sentenceId);
      });

      var arr = arethusaUtil.getProperty(comments, sentenceId);
      if (!arr) {
        arr = [];
        arethusaUtil.setProperty(comments, sentenceId, arr);
      }

      var span = sameSpan(arr, wIds);
      if (span) {
        span.comments.push(comment);
      } else {
        // We unshift on purpose - we want newly added comments on runtime to
        // appear on top of the list.
        span = new WrappedComment(wIds, comment);
        arr.unshift(span);
      }
      return span;
    }

    function sameSpan(arr, ids) {
      var ret;
      for (var i = 0; i < arr.length; i++) {
        var span = arr[i];
        if (angular.equals(span.ids, ids)) {
          ret = span;
          break;
        }
      }
      return ret;
    }

    function parseComment(commentObj, i) {
      var comment = commentObj.comment;
      var extracted = splitIdAndComment(comment);
      commentObj.comment = extracted[1];
      return addComments(extracted[0], commentObj);
    }

    function parseComments(res) {
      angular.forEach(res, parseComment);
      sortComments();
    }

    function sortCommentsOfChunk(wrappedComments, sentenceId) {
      comments[sentenceId] = wrappedComments.sort(function(a, b) {
        return a.ids > b.ids;
      });
    }


    function sortComments() {
      angular.forEach(comments, sortCommentsOfChunk);
    }

    function addFakeIdsAndStrings(comment) {
      var sentenceId = comment.sentenceId;
      var ids = comment.ids;
      var sourceIds = arethusaUtil.map(ids, function(id) {
        return idHandler.formatId(id, '%w');
      });
      var fakeId = '##' + sentenceId + '.' + sourceIds.join(',') + '##\n\n';
      var strings = '#!# ' + state.toTokenStrings(ids) + ' #!#\n\n';
      comment.comment = fakeId + strings + comment.comment;
    }

    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      this.getData = function(chunkId, callback) {
        if (alreadyLoaded) {
          callback(comments[chunkId]);
        } else {
          resource.get().then(function(res) {
            parseComments(res.data);
            callback(comments[chunkId]);
          });
          alreadyLoaded = true;
        }
      };

      this.saveData = function(comment, success, error) {
        addFakeIdsAndStrings(comment);
        resource.save(comment).then(function(res) {
          success(parseComment(res.data));
        }, error);
      };

      this.docLevelComments = function() {
        return comments.document;
      };
    };
  }
]);
