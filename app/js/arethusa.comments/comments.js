"use strict";

angular.module('arethusa.comments').service('comments', [
  'state',
  'configurator',
  'navigator',
  function(state, configurator, navigator) {
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
      retriever.getData(navigator.status.currentId, function(comments) {
        angular.extend(self.comments, comments);
      });
    }

    this.init = function() {
      configure();
      retrieveComments();
    };
  }
]);
