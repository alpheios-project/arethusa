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

  /* global X2JS */
  xmlParser: new X2JS(),

  xml2json: function(xml) {
    return arethusaUtil.xmlParser.xml2json(xml);
  }
};
