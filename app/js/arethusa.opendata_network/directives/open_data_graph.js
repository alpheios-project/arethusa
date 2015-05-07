"use strict";

angular.module('arethusa.opendataNetwork').directive('openDataGraph', [
  'state',
  function(state) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.nodes = {}
        scope.links = []

        scope.graph = {
          nodes : [],
          links : []
        }

        /**
         * Check if a node representing the token exists
         * @param  {token|string} token Target Token
         * @return {boolean}            Indicator of existence
         */
        var nodeExists = function(token) {
          var id = (typeof token === "string") ? token : token.id;
          return (typeof scope.nodes[id] !== "undefined")
        }

        /*
          Watching tokens graph properties
         */
        state.watch("graph", function(newVal, oldVal, event) {
          var token = event.token;
          if(!nodeExists(token)) {
            createToken(token);
          }
          cleanLinks(token.id);
          for (var i = newVal.length - 1; i >= 0; i--) {
            createLink(token.id, newVal[i]);
          };

          draw();
        });

        /**
         * Remove all links for a token
         * @param  {[type]} tokenId Id of the token whose links should be removed
         */
        var cleanLinks = function(tokenId) {
          var links = scope.links;
          for (var i = links.length - 1; i >= 0; i--) {
            if(links[i].source = tokenId) {
              delete links[i]; 
            }
          };
          scope.links = links;
        }

        /**
         * Create a link from source using link dictionary
         * @param  {string} sourceId Id of the Source token
         * @param  {Object} link     Object representing the link
         */
        var createLink = function(sourceId, link) {
          link.source = sourceId;
          scope.links.push(link);
          if(!nodeExists(link.target)) {
            createToken(state.getToken(link.target));
          }
        }

        /**
         * Create a token in our dictionary
         * @param  {token} token Token to be created
         * @return
         */
        var createToken = function(token) {
          scope.nodes[token.id] = {
            string: token.string,
            token: token
          }
          return;
        }

        var upgradeGraph = function() {
          var n = {},
              graph = {
                nodes : [],
                links : []
              };

          angular.forEach(scope.links, function(link) {
            var s = link.source,
                t = link.target;

            if(typeof n[s] === "undefined") {
              graph.nodes.push(scope.nodes[s]);
              n[s] = graph.nodes.length - 1;
            }
            
            if(typeof n[t] === "undefined") {
              graph.nodes.push(scope.nodes[t]);
              n[t] = graph.nodes.length - 1;
            }

            graph.links.push(link);
            var i = graph.links.length - 1;
            graph.links[i].source = n[s];
            graph.links[i].target = n[t];
          });

          scope.graph = graph;
        }

        var cleanSVG = function() {
          console.log(element);
        }

        /**
         * Draw a D3JS Graph like structure
         */
        var draw = function() {
          upgradeGraph();
          cleanSVG();

        }

        draw();

      },
      templateUrl: 'templates/arethusa.opendata_network/opendata_network_graph.html'
    };
  }
]);
