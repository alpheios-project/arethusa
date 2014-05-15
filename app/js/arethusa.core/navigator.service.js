"use strict";

angular.module('arethusa.core').service('navigator', function($injector) {
  var self = this;

  this.sentences = [];
  this.currentPosition = 0;

  this.status = {};

  this.state = function() {
    if (! self.lazyState) {
      self.lazyState = $injector.get('state');
    }
    return self.lazyState;
  };

  var currentId = function() {
    return currentSentenceObj().id;
  };

  var currentSentenceObj = function() {
    return self.sentences[self.currentPosition] || {};
  };

  this.currentSentence = function() {
    return currentSentenceObj().tokens;
  };

  this.nextSentence = function() {
    self.currentPosition++;
    self.state().replaceState(self.currentSentence());
    self.state().allLoaded = true;
    self.updateId();
  };

  this.prevSentence = function() {
    self.currentPosition--;
    self.state().replaceState(self.currentSentence());
    self.state().allLoaded = true;
    self.updateId();
  };

  this.updateId = function() {
    self.status.currentId = currentId();
  };

  this.reset = function() {
    self.currentPosition = 0;
    self.sentences = [];
  };
});
