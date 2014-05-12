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

    xit('displays a dependency tree', function() {
      var nodes = element.all(by.css("token"));
      var cum = nodes.first();
      var que = nodes.get(0);
      que.getCssValue("top").then(function(queTop) {
        cum.getCssValue("top").then(function(cumTop) {
          expect(queTop).toBeGreaterThan(cumTop);
        });
      });
    });
  });
});

