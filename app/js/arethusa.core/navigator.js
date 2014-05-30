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

    function findSentence(id) {
      var res;
      for (var i = self.sentences.length - 1; i >= 0; i--){
        if (self.sentences[i].id === id) {
          res = self.sentences[i];
          break;
        }
      }
      return res;
    }

    this.goTo = function(id) {
      var s = findSentence(id);
      if (s) {
        var i = self.sentences.indexOf(s);
        self.currentPosition = i;
        self.updateState();
      } else {
        /* global alert */
        alert('No sentence with id ' + id + ' found');
      }
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
