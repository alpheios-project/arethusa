"use strict";

describe('MainController', function() {
  beforeEach(module('annotationApp'));

  it('sets scope values', inject(function($controller) {
    var scope = {};
    var mystate = { "mystate": "state"};
    var ctrl = $controller('MainController', {$scope:scope, state:mystate, configurator: {
      conf_for : function(name) {
        return { plugins: "plugins", template: "template"};
      }
    }});

    expect(scope.state).toBe(mystate);
    expect(scope.plugins).toEqual("plugins");
    expect(scope.template).toBe("template");
  }));
});
