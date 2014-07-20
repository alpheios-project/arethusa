// DEPRECATED in this form - we have a much nicer API through state events
// now - we'll update this later, when we need it.
//
// Is NOT functional atm.

'use strict';
window.arethusaExternalApi = function () {
  var obj = {};
  obj.isArethusaLoaded = function () {
    try {
      angular.module('arethusa');
      return true;
    } catch (err) {
      return false;
    }
  };
  // I guess it might come to this sort of guarding close, so that other plugin
  // can implement this safely. We just ask if arethusa is loaded and proceed -
  // if it's not, we provide a mock object that just does nothing.
  if (obj.isArethusaLoaded()) {
    angular.element(document.body).ready(function () {
      obj.injector = angular.element(document.body).injector();
      obj.state = obj.injector.get('state');
      obj.scope = angular.element(document.getElementById('arethusa-main-view')).scope();
      //obj.apply = obj.scope.$apply;
      obj.fireEvent = function (token, category, oldVal, newVal) {
        obj.state.fireEvent(token, category, oldVal, newVal);
      };
    });
  } else {
  }
  return obj;
};
