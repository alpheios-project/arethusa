"use strict";

// Provides several classes frequently used in Arethusa

function ArethusaClasses() {
  function Setting(label, model, change) {
    this.label = label;
    this.model = model;
    this.change = change;
  }

  this.setting = function(l, m, c) { return new Setting(l, m, c); };
}

var arethusaClasses = new ArethusaClasses();
var aC = arethusaClasses;
