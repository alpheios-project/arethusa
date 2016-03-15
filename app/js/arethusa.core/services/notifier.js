'use strict';
/**
 * @ngdoc service
 * @name arethusa.core.notifier
 *
 * @description
 * Service to launch notifications.
 *
 * Uses [AngularJS-Toaster](http://github.com/jirikavi/AngularJS-Toaster) to bring
 * notifications immediately to the screen.  Also stores past notifications (cf. {@link arethusa.core.notifier#properties_messages notifier.messages}).
 *
 *
 * *Example Configuration*
 * ```
 * "notifier" : {
 *   "disable" : false,
 *   "maxMessages" : 10
 * }
 * ```
 *
 * @requires arethusa.core.configurator
 * @requires toaster
 * @requires $timeout
 */
angular.module('arethusa.core').service('notifier', [
  'configurator',
  'toaster',
  '$timeout',
  function(configurator, toaster, $timeout) {
    var self = this;

    function configure() {
      self.conf = configurator.configurationFor('notifier');

      /**
       * @ngdoc property
       * @name disable
       * @propertyOf arethusa.core.notifier
       *
       * @description
       * ***Configurable property***
       *
       * Set to true to disable all notifications. Defaults to false.
       */
      self.disable = self.conf.disable;

      /**
       * @ngdoc property
       * @name maxMessages
       * @propertyOf arethusa.core.notifier
       *
       * @description
       * ***Configurable property***
       *
       * Maximum number of messages stored within the service. Defaults to 15.
       */
      self.maxMessages = self.conf.maxMessages || 15;
    }

    /**
     * @ngdoc property
     * @name messages
     * @propertyOf arethusa.core.notifier
     *
     * @description
     * Array of messages objects. Acts stack-like when {@link arethusa.core.notifier#properties_maxMessages maxMessages} are reached.
     *
     * The objects come with the following properties:
     *
     * - *type*
     * - *message*
     * - *title*
     * - *time*
     */
    this.messages = [];

    function Message(type, message, title) {
      this.type = type;
      this.message = message;
      this.title = title;
      this.time = new Date();
    }

    function generate(type) {
      self[type] = function(message, title, debounce) {
        if (!self.disable) {
          self.addMessage(type, message, title, debounce);
        }
      };
    }

    /**
     * @ngdoc function
     * @name arethusa.core.notifier#success
     * @methodOf arethusa.core.notifier
     *
     * @description
     * Generates a *success* notification.
     *
     * @param {String} message Message body of the notification
     * @param {String} [title] Optional title/heading of the notification
     * @param {Number} [blockDuration] Optional duration during which a subsequent
     *   attempts to issue the exact same notification will supressed.
     */

    /**
     * @ngdoc function
     * @name arethusa.core.notifier#info
     * @methodOf arethusa.core.notifier
     *
     * @description
     * Generates an *info* notification.
     *
     * @param {String} message Message body of the notification
     * @param {String} [title] Optional title/heading of the notification
     * @param {Number} [blockDuration] Optional duration during which a subsequent
     *   attempts to issue the exact same notification will supressed.
     */

    /**
     * @ngdoc function
     * @name arethusa.core.notifier#wait
     * @methodOf arethusa.core.notifier
     *
     * @description
     * Generates a *wait* notification.
     *
     * @param {String} message Message body of the notification
     * @param {String} [title] Optional title/heading of the notification
     * @param {Number} [blockDuration] Optional duration during which a subsequent
     *   attempts to issue the exact same notification will supressed.
     */

    /**
     * @ngdoc function
     * @name arethusa.core.notifier#warning
     * @methodOf arethusa.core.notifier
     *
     * @description
     * Generates a *warning* notification.
     *
     * @param {String} message Message body of the notification
     * @param {String} [title] Optional title/heading of the notification
     * @param {Number} [blockDuration] Optional duration during which a subsequent
     *   attempts to issue the exact same notification will supressed.
     */

    /**
     * @ngdoc function
     * @name arethusa.core.notifier#error
     * @methodOf arethusa.core.notifier
     *
     * @description
     * Generates an *error* notification.
     *
     * @param {String} message Message body of the notification
     * @param {String} [title] Optional title/heading of the notification
     * @param {Number} [blockDuration] Optional duration during which a subsequent
     *   attempts to issue the exact same notification will supressed.
     */
    var types = ['success', 'info', 'wait', 'warning', 'error'];
    angular.forEach(types, generate);

    var debouncer = {};

    function messageKey(type, message, title) {
      return [type, message, title].join('||');
    }

    function messageAlreadyAdded(msgKey) {
      return debouncer[msgKey];
    }

    function cancelTimer(msgKey) {
      return function() {
        $timeout.cancel(debouncer[msgKey]);
      };
    }

    function addDebouncing(msgKey, duration) {
      debouncer[msgKey] = $timeout(cancelTimer, duration, false);
    }

    this.addMessage = function(type, message, title, debounce) {
      if (self.messages.length === self.maxMessages) {
        self.messages.pop();
      }

      var msgKey = messageKey(type, message, title);
      if (messageAlreadyAdded(msgKey)) return;
      if (debounce) addDebouncing(msgKey, debounce);

      var msg = new Message(type, message, title);
      self.messages.unshift(msg);
      toaster.pop(type, title, message);
    };

    this.toggle = function() {
      self.panelActive = !self.panelActive;
    };

    this.init = function() {
      configure();
    };
  }
]);
