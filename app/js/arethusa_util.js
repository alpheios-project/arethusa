"use strict";

// Provides the global arethusaUtil object which comes with several
// utility functions

var arethusaUtil = {
  // Pads a number with zeros
  formatNumber: function(number, length) {
    // check if number is valid, otherwise return
    var parsed = parseInt(number);
    if (isNaN(parsed)) {
      return number;
    } else {
      // coerce a fixnum to a string
      var n = "" + parsed;
      while (n.length < length) { n = "0" + n; }
      return n;
    }
  },

  // Apply a map/collect function over an Array
  map: function(container, fn) {
    var result = [];
    container.forEach(function(e) {
      result.push(fn(e));
    });
    return result;
  },

  // inject like ruby - or more like each_with_object
  // Take care - will not work with immutable memos!
  inject: function(memo, container, fn){
    if (arethusaUtil.isArray(container)) {
      container.forEach(function(el) {
        fn(memo, el);
      });
    } else {
      for (var key in container) {
        fn(memo, key, container[key]);
      }
    }
    return memo;
  },

  // flat push
  pushAll: function(target, pusher) {
    target.push.apply(target, pusher);
    return target;
  },

  findObj: function(object, fn) {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        var val = object[key];
        if (fn(val)) {
          return val;
        }
      }
    }
  },

  // Finds object properties in an arbitrarily deep object.
  // Check the specs for examples.
  //
  // Returns an object where the keys are the properties
  // that were looked for and where the values are arrays of objects
  // that have such a property.
  //
  // This is useful for find and replace tasks inside of objects, as the
  // array holds a direct reference to the property-containing object.
  findNestedProperties: function(nestedObj, properties) {
    var props = arethusaUtil.toAry(properties);
    return arethusaUtil.inject({}, props, function(memo, targetKey) {
      var fn = function(obj, key) {
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

  isArray: function(obj){
    return Object.prototype.toString.call(obj) === '[object Array]';
  },

  // wraps an
  toAry: function(el){
    if (arethusaUtil.isArray(el)) {
      return el;
    } else {
      return [el];
    }
  },

  replaceAt: function(str, i, replacement) {
    return str.substring(0, i) + replacement + str.substring(i + 1);
  },



  /* global X2JS */
  xmlParser: new X2JS(),

  xml2json: function(xml) {
    return arethusaUtil.xmlParser.xml_str2json(xml);
  }
};
