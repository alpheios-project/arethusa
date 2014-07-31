"use strict";

angular.module('arethusa.ne').service('ne', [
  'state',
  'configurator',
  function(state, configurator) {
    var self = this;
    var neRetriever;

    this.defaultConf = {
      name:"ne",
      template:"templates/arethusa.ne/ne.html"
    };

    function configure() {
      self.analyses = {};
      configurator.getConfAndDelegate('ne', self);
      neRetriever = configurator.getRetriever(self.conf.retriever);
      

    }

    configure();

    function iter() {
      self.neInfo ={};
      angular.forEach(state.tokens, function(token, id){
          neRetriever.getWord(token.string).then(function(res){
            self.neInfo[id] = res.data;
          });
      });
    }
    /*trying to make it only evaluate the selected token
    this.currentAnalyses = function () {
      var analyses = self.analyses;
      return arethusaUtil.inject({}, state.selectedTokens, function (obj, id, val) {
        var token = analyses[id];
        if (token) {
          obj[id] = token;
        }
      });
    };*/

    this.init = function() {
      configure();
      iter();
    };

  }
]);
