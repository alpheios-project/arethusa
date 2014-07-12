"use strict";

describe('MainCtrl', function() {
  beforeEach(module('arethusa'));

  it('sets scope values', inject(function($controller, $rootScope) {
    var scope = $rootScope.$new();
    var state = {
      init: function() {},
      allLoaded: false
    };
    var notifier = {
      init: function() {},
      success: function() {},
      info: function() {},
      error: function() {}
    };
    var configurator =  {
      configurationFor: function(name) {
        return { plugins: {}, template: "template"};
      }
    };
    var saver = { init: function() {} };
    var kC = { initCaptures: function() {} };

    var mainCtrlInits = {
      $scope: scope,
      configurator: configurator,
      state: state,
      notifier: notifier,
      saver: saver,
      keyCapture: kC
    };

    var ctrl = $controller('MainCtrl', mainCtrlInits);

    expect(scope.state).toBe(state);
    expect(scope.plugins).toBeUndefined();
    expect(scope.template).toBe("template");
  }));
});
