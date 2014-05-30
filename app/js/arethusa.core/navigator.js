'use strict';
angular.module('arethusa.core').service('navigator', [
  '$injector',
  function ($injector) {
    var self = this;
    this.sentences = [];
    this.currentPosition = 0;
    this.status = {};

    this.state = function () {
      if (!self.lazyState) {
        self.lazyState = $injector.get('state');
      }
      return self.lazyState;
    };

    var currentId = function () {
      return currentSentenceObj().id;
    };
    var currentSentenceObj = function () {
      return self.sentences[self.currentPosition] || {};
    };
    this.currentSentence = function () {
      return currentSentenceObj().tokens;
    };

    this.nextSentence = function () {
      self.movePosition(1);
    };
    this.prevSentence = function () {
      self.movePosition(-1);
    };

    this.hasNext = function() {
      return self.currentPosition < self.sentences.length - 1;
    };
    this.hasPrev = function() {
      return self.currentPosition > 0;
    };

    this.goToFirst = function() {
      self.currentPosition = 0;
      self.updateState();
    };

    this.goToLast = function() {
      self.currentPosition = self.sentences.length - 1;
      self.updateState();
    };

    this.updateState = function() {
      self.state().replaceState(self.currentSentence());
      self.updateId();
    };

    this.movePosition = function (steps) {
      self.currentPosition += steps;
      self.updateState();
    };

    this.updateId = function () {
      self.status.currentId = currentId();
    };

    this.reset = function () {
      self.currentPosition = 0;
      self.sentences = [];
      self.updateId();
    };
  }
]);
