"use strict";

annotationApp.service('text', function(state, configurator) {
  this.conf = configurator.conf_for('text');
  this.template = this.conf.template;
});
