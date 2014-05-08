"use strict";

describe('MainCtrl', function() {
  beforeEach(module('arethusa'));

  it('sets scope values', inject(function($controller) {
    var scope = {};
    var mystate = { "mystate": "state"};
    var ctrl = $controller('MainCtrl', {$scope:scope, state:mystate, configurator: {
      configurationFor : function(name) {
        return { plugins: {}, template: "template"};
      }
    }});

    expect(scope.state).toBe(mystate);
    expect(scope.plugins).toEqual({});
    expect(scope.template).toBe("template");
  }));
});
