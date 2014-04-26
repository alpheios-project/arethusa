describe('MainController', function() {
  beforeEach(module('annotationApp'));
  xit('loads tokens', inject(function($controller) {
    var scope = {};
    var ctrl = $controller('MainController', {$scope:scope});

    expect(scope.tokens.length).toBe(4);
  }));
});
