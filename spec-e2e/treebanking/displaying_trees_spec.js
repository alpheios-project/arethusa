"use strict";

describe('View treebank document', function(){
  beforeEach(function() {
    browser.get('/app/#/e2e?doc=caesar2&s=21');
  });

  it('displays the sentence and a tree', function() {
    // word in the sentence
    expect(element(by.css("p span span")).getText()).toEqual("In");

    // word in the tree
    expect(element(by.css("div.node span[token] span")).getInnerHtml()).toEqual("In");
  });
});

