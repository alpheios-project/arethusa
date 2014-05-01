"use strict";

angular.module('arethusa').service('comment', function(state, configurator) {
  this.conf = configurator.configurationFor('comment');
  this.comments = {
    "1" : {
      "id" : 1,
      "comment": "Marcus was someone."
    },
    "2" : {
      "id" : 2,
      "comment": "Nothing to see here."
    },
    "3" : {
      "id" : 3,
      "comment": "-"
    },
    "4" : {
      "id" : 4,
      "comment": "-"
    },
  };

  this.currentComments = function() {
    var res = [];
    var that = this;
    angular.forEach(state.selectedTokens, function(val, id) {
      var token = that.comments[id];
      if (token) {
        res.push(token);
      }
    });
    return res;
  };

  this.template = this.conf.template;
});
