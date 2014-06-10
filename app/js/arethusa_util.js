'use strict';
// Provides the global arethusaUtil object which comes with several
// utility functions
var arethusaUtil = {
    formatNumber: function (number, length) {
      // check if number is valid, otherwise return
      var parsed = parseInt(number);
      if (isNaN(parsed)) {
        return number;
      } else {
        // coerce a fixnum to a string
        var n = '' + parsed;
        while (n.length < length) {
          n = '0' + n;
        }
        return n;
      }
    },

    map: function (container, fn) {
      var result = [];
      container.forEach(function (e) {
        result.push(fn(e));
      });
      return result;
    },

    inject: function (memo, container, fn) {
      if (arethusaUtil.isArray(container)) {
        container.forEach(function (el) {
          fn(memo, el);
        });
      } else {
        for (var key in container) {
          fn(memo, key, container[key]);
        }
      }
      return memo;
    },

    pushAll: function (target, pusher) {
      target.push.apply(target, pusher);
      return target;
    },

    findObj: function (object, fn) {
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          var val = object[key];
          if (fn(val)) {
            return val;
          }
        }
      }
    },

    findNestedProperties: function (nestedObj, properties) {
      var props = arethusaUtil.toAry(properties);
      return arethusaUtil.inject({}, props, function (memo, targetKey) {
        var fn = function (obj, key) {
          var res = [];
          if (obj.hasOwnProperty(key)) {
            res.push(obj);
          }
          for (var k in obj) {
            var v = obj[k];
            if (typeof v == 'object' && (v = fn(v, key))) {
              arethusaUtil.pushAll(res, v);
            }
          }
          return res;
        };
        memo[targetKey] = fn(nestedObj, targetKey);
      });
    },

    isArray: function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    },

    toAry: function (el) {
      if (arethusaUtil.isArray(el)) {
        return el;
      } else {
        return [el];
      }
    },

    intersect: function(a, b) {
      var t; // temp
      if (a.length < b.length) {
        t = b;
        b = a;
        a = t;
      }
      function isIncluded(el) { return b.indexOf(el) !== -1; }
      return a.filter(isIncluded);
    },

    replaceAt: function (str, i, replacement) {
      return str.substring(0, i) + replacement + str.substring(i + 1);
    },

    isTerminatingPunctuation: function (str) {
      return str.match(/[\.;]/);
    },

    /* global X2JS */
    xmlParser: new X2JS(),

    xml2json: function (xml) {
      return arethusaUtil.xmlParser.xml_str2json(xml);
    },

    json2xml: function(json) {
      return arethusaUtil.xmlParser.json2xml_str(json);
    }
  };
