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

    it('takes a type, a message and an optional title as args', function() {
      var m1, m2;
      var type = 'success';
      var message = 'A message';
      var title = 'A title';
      notifier.addMessage(type, message);
      m1 = notifier.messages[0];
      expect(m1.type).toEqual(type);
      expect(m1.message).toEqual(message);
      expect(m1.title).toBeUndefined();

      notifier.addMessage(type, message, title);
      m2 = notifier.messages[0];
      expect(m2.title).toEqual(title);
    });

    it('messages have a timestamp', function() {
      notifier.addMessage('success', 'message');
      expect(notifier.messages[0].time).toBeDefined();
    });

    it('messages never exceed the limit of this.maxMessages', function() {
      notifier.maxMessages = 2;
      expect(notifier.messages.length).toEqual(0);
      notifier.addMessage('success', '1');
      notifier.addMessage('success', '2');
      expect(notifier.messages.length).toEqual(2);
      notifier.addMessage('success', '3');
      expect(notifier.messages.length).toEqual(2);
      expect(notifier.messages[0].message).toEqual('3');
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
      var title = 'A title.';

      notifier.success(message, title);
      var m = notifier.messages[0];
      expect(m.type).toEqual(type);
      expect(m.message).toEqual(message);
      expect(m.title).toEqual(title);
    });
  });

  describe('this.info', function() {
    it('logs an info message', function() {
      notifier.info('info', 'A message.');
      expect(notifier.messages[0].type).toEqual('info');
    });
  });

  describe('this.error', function() {
    it('logs an error message', function() {
      notifier.error('error', 'A message.');
      expect(notifier.messages[0].type).toEqual('error');
    });
  });
});
