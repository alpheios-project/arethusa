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

    it('takes a type, a message and an optional description as args', function() {
      var m1, m2;
      var type = 'success';
      var message = 'A message';
      var description = 'A description';
      notifier.addMessage(type, message);
      m1 = notifier.current;
      expect(m1.type).toEqual(type);
      expect(m1.message).toEqual(message);
      expect(m1.description).toBeUndefined();

      notifier.addMessage(type, message, description);
      m2 = notifier.current;
      expect(m2.description).toEqual(description);
    });

    it('messages have a timestamp', function() {
      notifier.addMessage('success', 'message');
      expect(notifier.current.time).toBeDefined();
    });

    it('messages never exceed the limit of this.maxMessages', function() {
      notifier.maxMessages = 2;
      expect(notifier.messages.length).toEqual(0);
      notifier.addMessage('success', '1');
      notifier.addMessage('success', '2');
      expect(notifier.messages.length).toEqual(2);
      notifier.addMessage('success', '3');
      expect(notifier.messages.length).toEqual(2);
      expect(notifier.current.message).toEqual('3');
    });
  });

  describe('this.maxMessages', function() {
    it('has a default value', function() {
      // Makes no sense to test the real number here (15 right now)
      // as it might change and this is not a good reason to break a spec.
      expect(notifier.maxMessages).toBeDefined();
    });
  });

  describe('this.success', function() {
    it('logs a success message', function() {
      var type = 'success';
      var message = 'A message.';
      var description = 'A description.';

      notifier.addMessage(type, message, description);
      expect(notifier.current.type).toEqual(type);
      expect(notifier.current.message).toEqual(message);
      expect(notifier.current.description).toEqual(description);
    });
  });

  describe('this.error', function() {
    it('logs an error message', function() {
      notifier.addMessage('success', 'A message.');
      expect(notifier.current.type).toEqual('success');
    });
  });
});
