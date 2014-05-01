"use strict";

annotationApp.service('history', function(state, configurator) {
  this.conf = configurator.conf_for('history');
  this.template = this.conf.template;
});
