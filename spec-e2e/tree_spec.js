"use strict";

describe('Dependency tree', function(){
  beforeEach(function() {
    browser.get('/app/#/staging2?doc=1&s=1');
  });

  var que;
  var cum;
  beforeEach(function() {
    var nodes = element.all(by.css("div span span"));
    nodes.map(function(elm, index) {
      return {
        index: index,
        text: elm.getText(),
        location: elm.getLocation(),
        element: elm
      };
    }).then(function(nodeInfos) {
      for (var index = 0; index < nodeInfos.length; ++index) {
        var element = nodeInfos[index];
        if (element.text === "que") {
          que = element;
        }
        if (element.text === "Cum") {
          cum = element;
        }
      }
    });
  });

  it('displays a dependency tree (que is above cum)', function() {
    expect(que).toBeDefined();
    expect(cum).toBeDefined();
    expect(que.location.y).toBeGreaterThan(cum.location.y);
  });

  describe('head change', function() {
    xit('displays a dependency tree (que is above cum)', function() {
      expect(que).toBeDefined();
      expect(cum).toBeDefined();
      que.element.click();
      cum.element.click();
      expect(que.location.y).toBeLessThan(cum.location.y);
    });
  });
});

