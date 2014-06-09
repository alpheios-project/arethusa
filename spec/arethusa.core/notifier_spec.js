"use strict";

describe("notifier", function() {
  var mockConfigurator = {
    configurationFor: function(name) {
      return {};
    },
  };

  beforeEach(module("arethusa.core", function($provide) {
    $provide.value('configurator', mockConfigurator);
  }));

  var notifier;
  beforeEach(inject(function(_notifier_) {
    notifier = _notifier_;
    notifier.init();
  }));

  describe('this.addMessage', function() {
    it('adds a message', function() {
      expect(notifier.messages.length).toEqual(0);
      notifier.addMessage('success', 'A message.');
      expect(notifier.messages.length).toEqual(1);
    });

    it('updates this.current to the most recent message', function() {
      var m1, m2;

      notifier.addMessage('success', 'A message.');
      m1 = notifier.current;
      expect(m1).toEqual(notifier.messages[0]);

      notifier.addMessage('error', 'Another message.');
      m2 = notifier.current;
      expect(m1).not.toEqual(notifier.messages[0]);
      expect(m2).toEqual(notifier.messages[0]);
    });
  });
});
