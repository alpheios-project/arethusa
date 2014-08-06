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
            if(token.string[0] === token.string[0].toUpperCase()){
              console.log(token.string);
              self.neInfo[id] = res.data;
              console.log(self.neInfo[id]);
            }
          });
      });
    }



    this.init = function() {
      configure();
      iter();
    };

  }
]);
