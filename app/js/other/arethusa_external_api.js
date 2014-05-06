"use strict";

window.ArethusaExternalApi = (function () {
  var obj = {};

  obj.isArethusaLoaded = function() {
    try {
      angular.module('arethusa');
    } catch(err) {
      return false;
    }
  };

  // I guess it might come to this sort of guarding close, so that other plugin
  // can implement this safely. We just ask if arethusa is loaded and proceed -
  // if it's not, we provide a mock object that just does nothing.
  if (obj.isArethusaLoaded) {
    angular.element(document.body).ready(function() {
      obj.state = angular.element(document.body).injector().get('state');
      console.log(obj.state);
    });

    //obj.state = injector().get('state');
    //obj.fireEvent = function(token, category, oldVal, newVal) {
      //obj.state.fireEvent(token, category, oldVal, newVal);
    //};
  } else {
    // tbd - BlackHole object
  }

  return obj;
}());
