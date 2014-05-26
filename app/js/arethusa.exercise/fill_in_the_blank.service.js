"use strict";

angular.module('arethusa.exercise').service('fillInTheBlank', function(configurator, morph, state) {
  var self = this;
  this.conf = configurator.configurationFor('fillInTheBlank');
  this.template = this.conf.template;
  this.name = this.conf.name;
  this.main = this.conf.main;

  this.started = false;

  this.fetchReport = function(args) {

  };

  this.answers = {};

  function createExercise() {
    return arethusaUtil.inject({}, state.tokens, function(memo, id, token) {
      var morph = token.morphology.attributes;
      if (morph.pos == 'verb' && morph.mood) {
        var lemma = token.morphology.lemma.replace(/\d/g, '');
        memo[id] = {
          hint: lemma + ', ' + morph.num + '.',
          answer: token.string,
          token: token
        };
      }
    });
  }

  this.hintFor = function(id) {
    return self.exercises[id].hint;
  };

  this.isExerciseTarget = function(id) {
    return id in self.exercises;
  };

  this.validate = function() {
    return arethusaUtil.inject({}, self.exercises, function(memo, id, ex) {
      var obj = {};
      if (ex.answer == self.answers[id]) {
        obj.correct = true;
      } else {
        obj.correct = false;
      }
    });
  };

  this.init = function() {
    self.report = {};
    self.exercises = createExercise();
  };
});
