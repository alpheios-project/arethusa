"use strict";

describe('Dependency tree', function(){
  var eratNode;
  var inNode;

  function searchForNodes() {
    var nodes = element.all(by.css("div.node span[token]"));
    return nodes.map(function(elm, index) {
      return {
        index: index,
        text: elm.findElement(by.css("span")).getInnerHtml(),
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
  }

  beforeEach(function() {
    browser.get('/app/#/e2e?doc=caesar2&s=21');
    searchForNodes();
  });

  xit('displays a dependency tree (erat is above in)', function() {
    expect(eratNode).toBeDefined();
    expect(inNode).toBeDefined();
    expect(inNode.location.y).toBeGreaterThan(eratNode.location.y);
  });

  describe('head change', function() {
    it('displays a dependency tree (in is above erat)', function() {
      expect(eratNode.element.getInnerHtml()).toBeDefined();
      expect(inNode.element.getInnerHtml()).toBeDefined();
      expect(inNode.location.y).toBeGreaterThan(eratNode.location.y);

      var execute = "arguments[0].click()";
      browser.executeScript(execute, eratNode.element);
      browser.executeScript(execute, inNode.element);

      browser.sleep(1000, function() {
        searchForNodes().then(function () {
          expect(inNode.location.y).toBeLessThan(eratNode.location.y);
        });
      });
    });
  });
});

