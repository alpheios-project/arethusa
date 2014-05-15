"use strict";

describe('Read tokens from xml url', function(){
  var sentence1Url = 'http://services.perseids.org/llt-data/1999.02.0002.2.1.1.xml';
  var sentence2Url = 'http://services.perseids.org/llt-data/1999.02.0002.2.1.2.xml';
  beforeEach(function() {
    browser.get('/app/#/tree');
  });

  describe('Sentence 1', function() {
    beforeEach(function() {
      element(by.model('query')).sendKeys(sentence1Url);
      element(by.buttonText('Search')).click();
    });

    it('displays a dependency tree (que is above cum)', function() {
      var nodes = element.all(by.css("tspan"));
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

