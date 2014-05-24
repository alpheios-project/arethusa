"use strict";

describe('Dependency tree', function(){
  beforeEach(function() {
    browser.get('/app/#/staging2?doc=1&s=1');
  });

  describe('Sentence 1', function() {
    beforeEach(function() {
    });

    it('displays a dependency tree (que is above cum)', function() {
      var nodes = element.all(by.css("div span span"));
      nodes.map(function(elm, index) {
        return {
          index: index,
          text: elm.getText(),
          location: elm.getLocation()
        };
      }).then(function(nodeInfos) {
        var que;
        var cum;
        for (var index = 0; index < nodeInfos.length; ++index) {
          var element = nodeInfos[index];
          if (element.text === "que") {
            que = element;
          }
          if (element.text === "Cum") {
            cum = element;
          }
        }
        expect(que).toBeDefined();
        expect(cum).toBeDefined();
        expect(que.location.y).toBeGreaterThan(cum.location.y);
      });
    });
  });
});

