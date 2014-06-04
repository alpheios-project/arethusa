"use strict";

describe('Dependency tree', function(){
  beforeEach(function() {
    browser.get('/app/#/e2e?doc=caesar2&s=21');
  });

  var eratNode;
  var inNode;
  beforeEach(function() {
    var nodes = element.all(by.css("div.node"));
    nodes.map(function(elm, index) {
      return {
        index: index,
        text: elm.findElement(by.css("span[token] span")).getInnerHtml(),
        location: elm.getLocation(),
        element: elm
      };
    }).then(function(nodeInfos) {
      for (var index = 0; index < nodeInfos.length; ++index) {
        var element = nodeInfos[index];
        if (element.text === "erat") {
          eratNode = element;
        }
        if (element.text === "In") {
          inNode = element;
        }
      }
    });
  });

  it('displays a dependency tree (erat is above in)', function() {
    expect(eratNode).toBeDefined();
    expect(inNode).toBeDefined();
    expect(inNode.location.y).toBeGreaterThan(eratNode.location.y);
  });

  describe('head change', function() {
    xit('displays a dependency tree (in is above erat)', function() {
      expect(eratNode).toBeDefined();
      expect(inNode).toBeDefined();


      eratNode.element.click();
      inNode.element.click();

      expect(inNode.location.y).toBeLessThan(eratNode.location.y);
    });
  });
});

