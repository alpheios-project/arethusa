"use strict";

angular.module('arethusa.opendataNetwork').directive('openDataGraph', [
  'state',
  function(state) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        var self = {};
        
        // General margin value so that trees don't touch the canvas border.
        var treeMargin = 15;
        var treeTemplate = '\
          <svg class="full-height full-width">\
            <g transform="translate(' + treeMargin + ',' + treeMargin + ')"/>\
          </svg>\
        ';
        var tree = angular.element(treeTemplate);
        var color = d3.scale.category20();

        // Will contain the dagreD3 graph, including all nodes, edges and label.
        self.g = undefined;

        // The g element contained in the svg canvas.
        self.vis = undefined;

        // Introspective variables about the tree canvas
        var height, width, xCenter, yCenter;

        //Scope informations
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
          cleanLinks(token.id);

          if(!nodeExists(token)) createToken(token.id);

          for (var i = newVal.length - 1; i >= 0; i--) {
            console.log(token.id)
            createLink(token.id, newVal[i]);
          };

          draw();
        });

        /**
         * Remove all links for a token
         * @param  {[type]} tokenId Id of the token whose links should be removed
         */
        var cleanLinks = function(tokenId) {
          var links = scope.links,
              l = [];
          for (var i = links.length - 1; i >= 0; i--) {
            if(links[i].source != tokenId) {
              l.push(links[i]); 
            }
          };
          console.log(l)
          scope.links = l;
        }

        /**
         * Create a link from source using link dictionary
         * @param  {string} sourceId Id of the Source token
         * @param  {Object} link     Object representing the link
         */
        var createLink = function(sourceId, link) {
          var target = link.target;
          if(!nodeExists(target)) {
            createToken(target);
          }

          link.source = sourceId;
          scope.links.push(link);
        }

        /**
         * Create a token in our dictionary
         * @param  {string} tokenId   ID of the Token to be created
         * @return
         */
        var createToken = function(tokenId) {
          var token = state.getToken(tokenId)
          scope.nodes[token.id] = {
            name: token.string,
            token: token
          }
          return;
        }

        /**
         * Update the scope.graph for D3
         * @return {[type]} [description]
         */
        var upgradeGraph = function() {
          var n = {},
              graph = {
                nodes : [],
                links : []
              },
              links = scope.links.slice();
          for (var y = links.length - 1; y >= 0; y--) {
            var link = scope.links[y],
                s = link.source,
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
            graph.links[i].value = link.weight;
          };

          return graph;
        }

        var cleanSVG = function() {
          if (self.g) self.g.selectAll('*').remove();
        }

        var render = function(graph) {
          var g,
              svg;

          self.svg = d3.select(element[0]);
          svg = self.g = self.svg.select('g');

          var force = d3.layout.force()
              .charge(-120)
              .linkDistance(30)
              .size([tree.width(), tree.height()]);

          force
            .nodes(graph.nodes)
            .links(graph.links)
            .start();

          var link = svg.selectAll(".link")
              .data(graph.links)
            .enter().append("line")
              .attr("class", "link")
              .style("stroke-width", function(d) { return Math.sqrt(d.value); });

          var node = svg.selectAll(".node")
              .data(graph.nodes)
            .enter().append("circle")
              .attr("class", "node")
              .attr("r", 5)
              .style("fill", function(d) { return color(d.group); })
              .call(force.drag);

          node.append("title")
              .text(function(d) { return d.name; });

          force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
          });
        }

        /**
         * Draw a D3JS Graph like structure
         */
        var draw = function() {
          if(!self.svg) {
            element.append(tree);
          }
          var graph = upgradeGraph();
          if(graph.nodes.length >= 2) {
            cleanSVG();
            render(graph);
          }
        }

        draw();

      },
      templateUrl: 'templates/arethusa.opendata_network/opendata_network_graph.html'
    };
  }
]);
