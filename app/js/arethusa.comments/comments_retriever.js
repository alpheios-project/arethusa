"use strict";

angular.module('arethusa.comments').factory('CommentsRetriever', [
  'configurator',
  function(configurator) {
    var comments = {};
    var alreadyLoaded;

    function splitIdAndComment(comment) {
      var regexp = new RegExp('^##(.*?)##\n\n(.*)$');
      var match = regexp.exec(comment);
      return match ? match.slice(1, 3) : ['noId', comment];
    }

    function addComments(id, comment) {
      var arr = arethusaUtil.getProperty(comments, id);
      if (!arr) {
        arr = [];
        arethusaUtil.setProperty(comments, id, arr);
      }
      arr.push(comment);
    }

    function parseComment(commentObj, i) {
      var comment = commentObj.comment;
      var extracted = splitIdAndComment(comment);
      commentObj.comment = extracted[1];
      addComments(extracted[0], commentObj);
    }

    function parseComments(res) {
      angular.forEach(res, parseComment);
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

      this.saveData = function(data, success, error) {
        resource.save(data).then(function(res) {
          parseComment(res.data);
          success();
        }, error);
      };
    };
  }
]);
