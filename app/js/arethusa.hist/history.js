'use strict';
angular.module('arethusa.hist').service('history', [
  'configurator',
  'keyCapture',
  'state',
  function (configurator, keyCapture, state) {
    var self = this;

    function configure() {
      configurator.getConfAndDelegate('history', self);
      self.maxSize = self.maxSize || 20;
    }

    function doSilent(fn) {
      state.doSilent(fn);
      checkAvailability();
    }

    function current() {
      return self.events[self.position];
    }

    function checkAvailability() {
      var any = self.events.length > 0;
      self.canUndo = any && self.position < self.events.length;
      self.canRedo = any && self.position > 0;
    }

    function HistEvent(token, type) {
      var id = token.id;

      this.token = token;
      this.type = type;
      this.time = new Date();

      if (type === 'add') {
        this.exec = function() {
          state.addToken(token, id);
        };
        this.undo = function() {
          state.removeToken(id);
        };
      } else { // type === removed
        this.exec = function() {
          state.removeToken(id);
        };
        this.undo = function() {
          state.addToken(token, id);
        };
      }
    }


/***************************************************************************
 *                            Public Functions                             *
 ***************************************************************************/

    this.undo = function() {
      if (self.canUndo) {
        doSilent(function() {
          current().undo();
          self.position++;
        });
      }
    };

    this.redo = function() {
      if (self.canRedo) {
        doSilent(function() {
          self.position--;
          current().exec();
        });
      }
    };

    this.saveEvent = function(event) {
      if (state.silent) return;

      var events = self.events;
      if (events.length === self.maxSize) events.pop();
      events.splice(0, self.position);
      self.position = 0;
      events.unshift(event);
      checkAvailability();
    };


/***************************************************************************
 *                          Watches and Listeners                          *
 ***************************************************************************/

    state.watch('*', function(n, o, event) {
      self.saveEvent(event);
    });

    state.on('tokenAdded', function(event, token) {
      var histEvent = new HistEvent(token, 'add');
      self.saveEvent(histEvent);
    });

    state.on('tokenRemoved', function(event, token) {
      var histEvent = new HistEvent(token, 'remove');
      self.saveEvent(histEvent);
    });



/***************************************************************************
 *                                  Init                                   *
 ***************************************************************************/

    keyCapture.initCaptures(function(kC) {
      return {
        history: [
          kC.create('undo', self.undo),
          kC.create('redo', self.redo)
        ]
      };
    });

    this.init = function() {
      configure();
      self.canRedo = false;
      self.canUndo = false;
      self.events = [];
      self.position = 0;
    };
  }
]);
