"use strict";

angular.module('arethusa.comments').factory('CommentsRetriever', [
  'configurator',
  function(configurator) {
    var test = [
      { "id": 47,
        "user": "Bridget Almas",
        "reason": "general",
        "created_at": "2014-07-30T12:34:33Z",
        "updated_at": "2014-07-30T12:34:33Z",
        "comment": "##1.3##\n\ntest comment"
      }
    ];

    var comments = {};

    function splitIdAndComment(comment) {
      var regexp = new RegExp('^##(.*?)##\n\n(.*)$');
      var match = regexp.exec(comment);
      return match ? match.slice(1, 3) : ['noId', comment];
    }

    function addComments(id, comment) {
      arethusaUtil.setProperty(comments, id, comment);
    }

    function parseComments(res) {
      angular.forEach(res, function(commentObj, i) {
        var comment = commentObj.comment;
        var extracted = splitIdAndComment(comment);
        commentObj.comment = extracted[1];
        addComments(extracted[0], commentObj);
      });
    }

    return function(conf) {
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      var alreadyLoaded;

      this.getData = function(chunkId, callback) {
        if (alreadyLoaded) {
          callback(comments[chunkId]);
        } else {
          resource.get().then(function(res) {
            parseComments(test); // this will be res.data of course
            callback(comments[chunkId]);
          });
        }
      };
    };
  }
]);
