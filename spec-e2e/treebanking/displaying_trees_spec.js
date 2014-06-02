"use strict";

describe('View treebank document', function(){
  beforeEach(function() {
    browser.get('/app/#/e2e?doc=caesar2&s=21');
  });

  iit('displays the sentence and a tree', function() {
    var sentenceElement = by.css("p span span");
    browser.wait(function() {
      return browser.isElementPresent(sentenceElement);
    }, 8000);
    // word in the sentence
    expect(element(sentenceElement).getText()).toEqual("In");

    // word in the tree
    expect(element(by.css("div.node span[token] span")).getInnerHtml()).toEqual("In");
  });
});

