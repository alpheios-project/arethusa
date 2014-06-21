"use strict";

angular.module('arethusa.sg').factory('SgGrammarRetriever', [
  'configurator',
  function(configurator) {
    var fileIndex = {
      "body.1_div1.1_div2.1" : [1, 45],
      "body.1_div1.1_div2.2" : [46, 76],
      "body.1_div1.1_div2.3" : [77, 132],
      "body.1_div1.1_div2.4" : [133],
      "body.1_div1.1_div2.5" : [134, 137],
      "body.1_div1.1_div2.6" : [138, 148],
      "body.1_div1.1_div2.7" : [149, 187],
      "body.1_div1.1_div2.8" : [188],
      "body.1_div1.2_div2.1" : [189, 193],
      "body.1_div1.2_div2.2" : [194, 204],
      "body.1_div1.2_div2.3" : [205, 210],
      "body.1_div1.2_div2.4" : [211, 312],
      "body.1_div1.2_div2.5" : [313, 324],
      "body.1_div1.2_div2.6" : [325, 340],
      "body.1_div1.2_div2.7" : [341, 346],
      "body.1_div1.2_div2.8" : [347, 354],
      "body.1_div1.2_div2.9" : [355, 495],
      "body.1_div1.2_div2.10" : [496, 821],
      "body.1_div1.3_div2.17" : [838, 856],
      "body.1_div1.3_div2.18" : [857, 858],
      "body.1_div1.3_div2.19" : [859, 865],
      "body.1_div1.3_div2.20" : [866, 868],
      "body.1_div1.3_div2.21" : [869, 899],
      "body.1_div1.4_div2.1" : [900, 905],
      "body.1_div1.4_div2.2" : [906, 920],
      "body.1_div1.4_div2.3" : [921],
      "body.1_div1.4_div2.4" : [922, 924],
      "body.1_div1.4_div2.5" : [925, 926],
      "body.1_div1.4_div2.6" : [927, 928],
      "body.1_div1.4_div2.7" : [929, 937],
      "body.1_div1.4_div2.8" : [938, 943],
      "body.1_div1.4_div2.9" : [944, 948],
      "body.1_div1.4_div2.10" : [949, 995],
      "body.1_div1.4_div2.11" : [996, 1012],
      "body.1_div1.4_div2.12" : [1013, 1015],
      "body.1_div1.4_div2.13" : [1016, 1017],
      "body.1_div1.4_div2.14" : [1018, 1093],
      "body.1_div1.4_div2.15" : [1094, 1098],
      "body.1_div1.4_div2.16" : [1099, 1189],
      "body.1_div1.4_div2.17" : [1190, 1278],
      "body.1_div1.4_div2.18" : [1279, 1635],
      "body.1_div1.4_div2.19" : [1636, 1702],
      "body.1_div1.4_div2.20" : [1703, 1965],
      "body.1_div1.4_div2.21" : [1966, 2038],
      "body.1_div1.4_div2.22" : [2039, 2148],
      "body.1_div1.4_div2.23" : [2149, 2152],
      "body.1_div1.4_div2.24" : [2153, 2158],
      "body.1_div1.4_div2.25" : [2159, 2161],
      "body.1_div1.4_div2.26" : [2162, 2172],
      "body.1_div1.4_div2.27" : [2173, 2188],
      "body.1_div1.4_div2.28" : [2189, 2190],
      "body.1_div1.4_div2.29" : [2191, 2487],
      "body.1_div1.4_div2.30" : [2488, 2573],
      "body.1_div1.4_div2.31" : [2574, 2635],
      "body.1_div1.4_div2.32" : [2636, 2662],
      "body.1_div1.4_div2.33" : [2663, 2680],
      "body.1_div1.4_div2.34" : [2681, 2687],
      "body.1_div1.4_div2.35" : [2688, 2768],
      "body.1_div1.4_div2.36" : [2769, 3003],
      "body.1_div1.4_div2.37" : [3004, 3048]
    };

    function parseSections(sections) {}

    return function(conf) {
      var doc;
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      function selectAndCallback(sections, callback) {
        // parse the sections, and return the right ones instead of the doc
        callback(doc);
      }

      this.getData = function(sections, callback) {
        if (doc) {
          selectAndCallback(sections, callback);
          callback(doc);
        } else {
          resource.get({ doc: "body.1_div1.4_div2.37" }).then(function(res) {
            doc = res;
            selectAndCallback(sections, callback);
          });
        }
      };
    };
  }
]);
