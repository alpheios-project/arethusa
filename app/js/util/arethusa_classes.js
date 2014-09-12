"use strict";

// Provides several classes frequently used in Arethusa

function ArethusaClasses() {
  // Used to define plugin settings
  function Setting(label, model, change) {
    this.label = label;
    this.model = model;
    this.change = change;
  }

  this.setting = function(l, m, c) { return new Setting(l, m, c); };


  // Used by retrievers to place documents in the document store
  function Doc(xml, json, conf) {
    this.xml = xml;
    this.json = json;
    this.conf = conf;
  }

  this.doc = function(x, j, c) { return new Doc(x, j, c); };
}

var arethusaClasses = new ArethusaClasses();
var aC = arethusaClasses;
