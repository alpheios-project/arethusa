"use strict";

describe('MainController', function() {
  beforeEach(module('annotationApp'));

  it('sets scope values', inject(function($controller) {
    var scope = {};
    var mystate = { "mystate": "state"};
    var ctrl = $controller('MainController', {$scope:scope, state:mystate, configurator: {
      conf_for : function(name) {
        return { plugins: { "plugin1" : {}, "plugin2" : {} }, template: "template"};
      }
    }});

    expect(scope.state).toBe(mystate);
    expect(scope.plugins).toEqual(['plugin1', 'plugin2']);
    expect(scope.template).toBe("template");
  }));
});
