"use strict";

angular.module('arethusa.comments').service('comments', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    var retriever;

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
      // hardcoded for development
      retriever.getData('1', function(comments) {
        angular.extend(self.comments, comments);
      });
    }

    this.init = function() {
      configure();
      retrieveComments();
    };
  }
]);
