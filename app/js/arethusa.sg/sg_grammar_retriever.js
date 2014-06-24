"use strict";

angular.module('arethusa.sg').factory('SgGrammarRetriever', [
  'configurator',
  'Range',
  function(configurator, Range) {
    var fileIndex = {
      "body.1_div1.1_div2.1"  : new Range(1, 45),
      "body.1_div1.1_div2.2"  : new Range(46, 76),
      "body.1_div1.1_div2.3"  : new Range(77, 132),
      "body.1_div1.1_div2.4"  : new Range(133),
      "body.1_div1.1_div2.5"  : new Range(134, 137),
      "body.1_div1.1_div2.6"  : new Range(138, 148),
      "body.1_div1.1_div2.7"  : new Range(149, 187),
      "body.1_div1.1_div2.8"  : new Range(188),
      "body.1_div1.2_div2.1"  : new Range(189, 193),
      "body.1_div1.2_div2.2"  : new Range(194, 204),
      "body.1_div1.2_div2.3"  : new Range(205, 210),
      "body.1_div1.2_div2.4"  : new Range(211, 312),
      "body.1_div1.2_div2.5"  : new Range(313, 324),
      "body.1_div1.2_div2.6"  : new Range(325, 340),
      "body.1_div1.2_div2.7"  : new Range(341, 346),
      "body.1_div1.2_div2.8"  : new Range(347, 354),
      "body.1_div1.2_div2.9"  : new Range(355, 495),
      "body.1_div1.2_div2.10" : new Range(496, 821),
      "body.1_div1.3_div2.17" : new Range(838, 856),
      "body.1_div1.3_div2.18" : new Range(857, 858),
      "body.1_div1.3_div2.19" : new Range(859, 865),
      "body.1_div1.3_div2.20" : new Range(866, 868),
      "body.1_div1.3_div2.21" : new Range(869, 899),
      "body.1_div1.4_div2.1"  : new Range(900, 905),
      "body.1_div1.4_div2.2"  : new Range(906, 920),
      "body.1_div1.4_div2.3"  : new Range(921),
      "body.1_div1.4_div2.4"  : new Range(922, 924),
      "body.1_div1.4_div2.5"  : new Range(925, 926),
      "body.1_div1.4_div2.6"  : new Range(927, 928),
      "body.1_div1.4_div2.7"  : new Range(929, 937),
      "body.1_div1.4_div2.8"  : new Range(938, 943),
      "body.1_div1.4_div2.9"  : new Range(944, 948),
      "body.1_div1.4_div2.10" : new Range(949, 995),
      "body.1_div1.4_div2.11" : new Range(996, 1012),
      "body.1_div1.4_div2.12" : new Range(1013, 1015),
      "body.1_div1.4_div2.13" : new Range(1016, 1017),
      "body.1_div1.4_div2.14" : new Range(1018, 1093),
      "body.1_div1.4_div2.15" : new Range(1094, 1098),
      "body.1_div1.4_div2.16" : new Range(1099, 1189),
      "body.1_div1.4_div2.17" : new Range(1190, 1278),
      "body.1_div1.4_div2.18" : new Range(1279, 1635),
      "body.1_div1.4_div2.19" : new Range(1636, 1702),
      "body.1_div1.4_div2.20" : new Range(1703, 1965),
      "body.1_div1.4_div2.21" : new Range(1966, 2038),
      "body.1_div1.4_div2.22" : new Range(2039, 2148),
      "body.1_div1.4_div2.23" : new Range(2149, 2152),
      "body.1_div1.4_div2.24" : new Range(2153, 2158),
      "body.1_div1.4_div2.25" : new Range(2159, 2161),
      "body.1_div1.4_div2.26" : new Range(2162, 2172),
      "body.1_div1.4_div2.27" : new Range(2173, 2188),
      "body.1_div1.4_div2.28" : new Range(2189, 2190),
      "body.1_div1.4_div2.29" : new Range(2191, 2487),
      "body.1_div1.4_div2.30" : new Range(2488, 2573),
      "body.1_div1.4_div2.31" : new Range(2574, 2635),
      "body.1_div1.4_div2.32" : new Range(2636, 2662),
      "body.1_div1.4_div2.33" : new Range(2663, 2680),
      "body.1_div1.4_div2.34" : new Range(2681, 2687),
      "body.1_div1.4_div2.35" : new Range(2688, 2768),
      "body.1_div1.4_div2.36" : new Range(2769, 3003),
      "body.1_div1.4_div2.37" : new Range(3004, 3048)
    };

    function parseSections(sections) {
      var intervals = sections.split(';');
      return arethusaUtil.map(intervals, function(interval) {
        return new Range(interval.split('-'));
      });
    }

    function time(x) {
      var t = new Date();
      return t.getMinutes() + ':' + t.getSeconds() + ' - ' + x;
    }

    function filesToUse(ranges) {
      return arethusaUtil.inject({}, ranges, function(memo, range) {
        var files = arethusaUtil.inject([], fileIndex, function(memo, file, r) {
          if (range.sharesElements(r)) {
            memo.push(file);
          }
        });
        if (files.length) {
          memo[range.toString()] = files;
        }
      });
    }

    function selectAndCallback(doc, range, callback) {
      var selections = arethusaUtil.inject([], range.take(5), function(memo, idNum) {
        var id = "#s" + idNum;
        var el = angular.element(id, angular.element(doc));
        memo.push(el.prev(':header'));
        memo.push(el);
      });
      callback(selections);
    }

    return function(conf) {
      var docs = {};
      var self = this;
      var resource = configurator.provideResource(conf.resource);

      function getFile(name) {
        return resource.get({ doc: name });
      }

      this.getData = function(sections, callback) {
        var ranges = parseSections(sections);
        var rangesAndFiles = filesToUse(ranges);
        angular.forEach(rangesAndFiles, function(files, rangeString) {
          var range = new Range(rangeString);
          angular.forEach(files, function(file, i) {
            var doc = docs[file];
            if (doc) {
              selectAndCallback(doc, range, callback);
            } else {
              getFile(file).then(function(res) {
                doc = res.data;
                docs[file] = doc;
                selectAndCallback(doc, range, callback);
              });
            }
          });
        });
      };
    };
  }
]);
