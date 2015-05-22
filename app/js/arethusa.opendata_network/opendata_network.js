"use strict";

angular.module('arethusa.opendataNetwork').service('opendataNetwork', [
  'state',
  'configurator',
  'globalSettings',
  'notifier',
  'translator',
  function(state, configurator, globalSettings, notifier, translator) {
    var self = this;
    this.name = 'opendataNetwork';

    this.externalDependencies = {
      ordered: [
        "bower_components/d3/d3.min.js",
        "bower_components/svg-curve-lib/src/js/svg-curve-lib.js"
      ]
    };
    
    this.defaultConf = {
      template: 'templates/arethusa.opendata_network/opendata_network.html',
      multipleLinks: false,
      mergeLinks : false,
      edgeLabel : false,
      ontologyLabel : false,
      defaultEdgeLabel : "+",
      color: {},
      weight : {}
    };
    
    var translations = {};

    /**
     * [configure description]
     * @return {[type]} [description]
     */
    var configure = function() {
      configurator.getConfAndDelegate(self);
    };

    /**
     * [makeLinkId description]
     * @param  {[type]} source   [description]
     * @param  {[type]} targetId [description]
     * @return {[type]}          [description]
     */
    var makeLinkId = function(source, targetId) {
      return source.linkCounter + "_" + source.id + "_" + targetId;
    };

    /**
     * Create a link template
     * @param  {token} source  Source token
     * @param  {token} target  Target token
     * @return {Object} 
     */
    var linkTemplate = function(source, target) {
      return {
        id: makeLinkId(source, target.id),
        target: target.id,
        source: source.id,
        weight: 1,
        type : null,
        group : 0
      };
    };

    /**
     * Create a link between two tokens
     * @param  {token} source  Source token
     * @param  {token} target  Target token
     */
    var changeLink = function (source, target) {
      var link = linkTemplate(source, target);

      source.linkCounter = source.linkCounter + 1;
      source.graph.push(link);
      var graph = source.graph;
      state.change(source, 'graph', graph);
    };

    /**
     * Action trigger while clicking on a target node
     * @type {function}
     */
    var changeLinkAction = function(id) {
      self.changeLink(id);
    };

    /**
     * Returns the current status of target selection
     * @param  {string|int} id    Identifier of the token
     * @param  {JsEvent}    event Javascript Event
     * @return {boolean}          Indicator of target selection
     */
    var awaitingLinkChange = function (id, event) {
      return !state.isSelected(id) && state.hasClickSelections() && !event.ctrlKey;
    };

    /**
     * Action run on click, until a linkChange is made, to add a class
     * @return {<Object.string, function>} Javascript event functions dictionary
     */
    var preLinkChange = function() {
      return {
        'mouseenter' : function(id, element, event) {
          if (awaitingLinkChange(id, event)) {
            element.addClass('copy-cursor');
          }
        },
        'mouseleave' : function(id, element, event) {
          element.removeClass('copy-cursor');
        }
      };
    };

    /**
     * Add the link property for each token if not there
     */
    var addMissingLinksToState = function () {
      angular.forEach(state.tokens, addLink);
    };

    /**
     * Check whether given token has a graph property
     * @param  {<Object>}  token  Text token
     * @return {Boolean}          Indicator of @graph property presence
     */
    var hasLink = function(token) {
      return (typeof token.graph !== "undefined" && token.graph.length > 0);
    };

    /**
     * Add @graph and @linkCounter properties if required
     * @param  {<Object>}  token  Text token
     */
    var addLink = function(token) {
      if(!hasLink(token)) {
        token.graph = [];
        token.linkCounter = token.graph.length;
      }
      if(typeof token.linkCounter === "undefined" ) {
        token.linkCounter = token.graph.length;
      }
    };

    /**
     * Disconnect a token in the graph
     * @param  {<Object>}  token  Text token
     */
    self.disconnect = function(token) {
      return;
    };

    /**
     * [getLinksToChange description]
     * @param  {<Object>}  token  Text token
     * @return {[type]}       [description]
     */
    var getLinksToChange = function (token) {
      var sentenceId = token.sentenceId;
      var id  = token.id;
      var notAllowed;
      var res = [];
      for (var otherId in state.clickedTokens) {
        var otherToken = state.getToken(otherId);
        if (otherToken.sentenceId !== sentenceId) {
          notAllowed = true;
          break;
        }
        if (id !== otherId) {
          res.push(otherToken);
        }
      }
      return notAllowed ? 'err': (res.length ? res : false);
    };


    /**
     * [changeLink description]
     * @param  {string|token} idOrToken [description]
     * @return {boolean}                Indicator of link changes
     */
    this.changeLink = function(idOrToken) {
      var token = angular.isString(idOrToken) ? state.getToken(idOrToken) : idOrToken;
      var linksToChange = getLinksToChange(token);

      if (linksToChange) {
        if (linksToChange === 'err') {
          notifier.error(translations.errorAcrossSentences);
          return;
        }
        state.doBatched(function() {
          angular.forEach(linksToChange, function(otherToken, i) {
            changeLink(otherToken, token);
          });
        });
        return true;
      } else {
        return false;
      }
    };

    /*
      Action triggered when a new token is added
     */
    state.on('tokenAdded', function(event, token) {
      addLink(token);
    });

    /*
      Action triggered when a token is removed
     */
    state.on('tokenRemoved', function(event, token) {
      // We need to disconnect manually, so that this event
      // can be properly undone.
      if (hasLink(token)) self.disconnect(token);
      var id = token.id;
      angular.forEach(state.tokens, function(t, i) {
        if (t.head.id === id) {
          self.disconnect(t);
        }
      });
    });

    var clickActionName = 'change connection';
    globalSettings.addClickAction(clickActionName, changeLinkAction, preLinkChange());

    this.init = function() {
      configure();
      addMissingLinksToState();

      if (self.mode === 'editor') {
        globalSettings.setClickAction(clickActionName);
      }
    };
  }
]);
