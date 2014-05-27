"use strict";

describe('key-capture directive', function() {
  var element;
  var $scope;
  var keyCapture = {
    keyDownEvent : false,
    keyUpEvent : false,
    keydown : function(event) {
      this.keyDownEvent = true;
    },
    keyup : function(event) {
      this.keyUpEvent = true;
    }
  };

  beforeEach(module('arethusa.core'));
  beforeEach(module(function($provide) {
    keyCapture.keyDownEvent = false;
    keyCapture.keyUpEvent = false;
    $provide.value('keyCapture', keyCapture);
  }));
  beforeEach(inject(function ($compile, $rootScope) {
    $scope = $rootScope;
    element = angular.element("<div key-capture />");
    $compile(element)($rootScope);
  }));

  it('captures key down events', function() {
    element.triggerHandler('keydown');

    expect(keyCapture.keyDownEvent).toBe(true);
  });

  it('captures key up events', function() {
    element.triggerHandler('keyup');

    expect(keyCapture.keyUpEvent).toBe(true);
  });
});
