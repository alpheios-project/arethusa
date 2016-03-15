'use strict';
angular.module('arethusa.exercise').service('fillInTheBlank', [
  'configurator',
  'morph',
  'state',
  function (configurator, morph, state) {
    var self = this;
    function configure() {
      configurator.getConfAndDelegate('fillInTheBlank', self);
      self.started = false;
      self.answers = {};
    }
    configure();
    function createExercise() {
      return arethusaUtil.inject({}, state.tokens, function (memo, id, token) {
        var morph = token.morphology.attributes;
        if (morph && morph.pos == 'verb' && morph.mood) {
          var lemma = token.morphology.lemma.replace(/\d/g, '');
          memo[id] = {
            hint: lemma,
            answer: token.string,
            token: token
          };
        }
      });
    }
    this.hintFor = function (id) {
      return self.exercises[id].hint;
    };
    this.isExerciseTarget = function (id) {
      return id in self.exercises;
    };
    this.validate = function () {
      var result = {
          tokens: {},
          correct: 0,
          wrong: 0
        };
      angular.forEach(self.exercises, function (ex, id) {
        var obj = {};
        var answer = ex.answer;
        var input = self.answers[id];
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
      self.report = result;
      return result;
    };
    this.init = function () {
      configure();
      delete self.report;
      self.exercises = createExercise();
    };
  }
]);
