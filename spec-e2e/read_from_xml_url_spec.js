"use strict";

describe('Read tokens from xml url', function(){
  var url = 'http://services.perseids.org/llt-data/1999.02.0002.2.1.1.xml';
  beforeEach(function() {
    browser.get('/app/index.html');

    element(by.model('query')).sendKeys(url);
    element(by.buttonText('Search')).click();
  });

  iit('changes the url', function() {
    // change %3A to : because angular doesn't encode it
    var expectedParameterUrl = encodeURIComponent(url).replace("%3A", ":");
    expect(browser.getCurrentUrl()).toContain("?input=" + expectedParameterUrl);
  });

});

