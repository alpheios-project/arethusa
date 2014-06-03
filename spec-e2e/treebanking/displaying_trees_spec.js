"use strict";

describe('View treebank document', function(){
  beforeEach(function() {
    browser.get('/app/#/e2e?doc=caesar2&s=21');
    browser.waitForAngular();
  });

  iit('displays the sentence and a tree', function() {
    var sentenceElement = by.css("p span span");
    var treeNode = by.css("div.node span[token] span");

    // word in the sentence
    expect(element(sentenceElement).getText()).toEqual("In");
    browser.waitForAngular();

    // word in the tree
    expect(element(treeNode).getInnerHtml()).toEqual("In");
  });
});

