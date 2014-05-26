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
    var result = {
      tokens: {},
      correct: 0,
      wrong: 0
    };

    angular.forEach(self.exercises, function(ex, id) {
      var obj = {};
      var answer = ex.answer;
      var input  = self.answers[id];

      if (answer == input) {
        result.correct++;
        obj.correct = true;
      } else {
        result.wrong++;
        obj.correct = false;
        obj.answer = answer;
        obj.input = input ? input : 'nothing';
      }
      result.tokens[id] = obj;
    });

    return result;
  };

  this.init = function() {
    self.report = {};
    self.exercises = createExercise();
  };
});
