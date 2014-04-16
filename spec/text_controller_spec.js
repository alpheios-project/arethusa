describe('TextController', function() {
  beforeEach(module('annotationApp'));
  it('loads tokens', inject(function($controller) {
    var scope = {};
    var ctrl = $controller('TextController', {$scope:scope});

    expect(scope.tokens.length).toBe(4);
  }));
});
