"use strict";

// Provides the global arethusaUtil object which comes with several
// utility functions

window.arethusaUtil = {
  // Pads a number with zeros
  formatNumber: function(number, length) {
    // coerce a fixnum to a string
    var n = "" + number;
    while (n.length < length) { n = "0" + n; }
    return n;
  }
};
