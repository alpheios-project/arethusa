"use strict";

describe('ArethusaCtrl', function() {
  beforeEach(module('arethusa'));

  it('sets scope values after conf has been loaded', inject(function($controller, $rootScope) {
    var scope = $rootScope.$new();

    var state = {
      init: function() {},
      allLoaded: false
    };

    var mainCtrlInits = {
      $scope: scope,
      configurator: arethusaMocks.configurator({
        configurationFor: function () {
          return { template: "template", plugins: {} };
        }
      }),
      state: state,
      notifier: arethusaMocks.notifier(),
      saver: arethusaMocks.saver(),
      history: arethusaMocks.history(),
      plugins: arethusaMocks.plugins(),
      translator: function() {}
    };

    var ctrl = $controller('ArethusaCtrl', mainCtrlInits);

    expect(scope.state).toBeUndefined();
    expect(scope.template).toBeUndefined();

    $rootScope.$broadcast('confLoaded');

    expect(scope.state).toBe(state);
    expect(scope.template).toBe("template");
  }));
});
