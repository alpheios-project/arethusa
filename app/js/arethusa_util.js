"use strict";

// Provides the global arethusaUtil object which comes with several
// utility functions

var arethusaUtil = {
  // Pads a number with zeros
  formatNumber: function(number, length) {
    // coerce a fixnum to a string
    var n = "" + number;
    while (n.length < length) { n = "0" + n; }
    return n;
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
    container.forEach(function(el) {
      fn(memo, el);
    });
    return memo;
  },

  // flat push
  pushAll: function(target, pusher) {
    target.push.apply(target, pusher);
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

  // wraps an
  toAry: function(el){
    if (Object.prototype.toString.call(el) === '[object Array]') {
      return el;
    } else {
      return [el];
    }
  },

  /* global X2JS */
  xmlParser: new X2JS(),

  xml2json: function(xml) {
    return arethusaUtil.xmlParser.xml2json(xml);
  }
};
