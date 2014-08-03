"use strict";

angular.module('arethusa.comments').factory('CommentsRetriever', [
  'configurator',
  'idHandler',
  function(configurator, idHandler) {
    var comments = {};
    var alreadyLoaded;

    function splitIdAndComment(comment) {
      var regexp = new RegExp('^##(.*?)##\n\n(.*)$');
      var match = regexp.exec(comment);
      return match.slice(1, 3);
    }

    function WrappedComment(ids, comment) {
      this.ids = ids;
      this.comments = [comment];
    }

    function addComments(id, comment) {
      var sIdAndWIds = id.split('.');

      var sId  = sIdAndWIds[0];
      var wIds = arethusaUtil.map(sIdAndWIds[1].split(','), function(id) {
        return idHandler.getId(id);
      });

      var arr = arethusaUtil.getProperty(comments, sId);
      if (!arr) {
        arr = [];
        arethusaUtil.setProperty(comments, sId, arr);
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

    function sortCommentsOfChunk(wrappedComments, sId) {
      comments[sId] = wrappedComments.sort(function(a, b) {
        return a.ids > b.ids;
      });
    }


    function sortComments() {
      angular.forEach(comments, sortCommentsOfChunk);
    }

    function addFakeIds(comment) {
      var sId = comment.sId;
      var ids = comment.ids;
      var sourceIds = arethusaUtil.map(ids, function(id) {
        return idHandler.formatId(id, '%w');
      });
      var fakeId = '##' + sId + '.' + sourceIds.join(',') + '##\n\n';
      comment.comment = fakeId + comment.comment;
    }

    // This is to satisfy the Perseids API for now, will later be
    // handled by Perseids itself.
    // Cf. http://github.com/PerseusDL/perseids_docs/issues/152
    function addReason(comment) {
      comment.reason = "general";
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
        addFakeIds(comment);
        addReason(comment);
        resource.save(comment).then(function(res) {
          success(parseComment(res.data));
        }, error);
      };
    };
  }
]);
