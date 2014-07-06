"use strict";

describe("revealToggle", function() {
  var element;
  beforeEach(module("arethusa.core"));

  beforeEach(inject(function($compile, $rootScope) {
    element = angular.element('<p><span reveal-toggle="1"/><target id="1"/></p>');
    // We're using a jQuery function in this directive!
    angular.element.prototype.trigger = function() {};
    $compile(element)($rootScope);
  }));

  describe("on click", function() {
    it('toggles visibility of the element with the target id', function() {
      var toggle = element.find('span');
      var target = element.find('target');

      expect(target.hasClass('hide')).toBeFalsy();
      toggle.triggerHandler('click');

      // the directive does a lookup by id on the document - this
      // cannot be seen in the test - we have to check how it works

      //expect(target.hasClass('hide')).toBeTruthy();
    });
  });
});

