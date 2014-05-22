"use strict";

/* global dagreD3 */

angular.module('arethusa.depTree').directive('dependencyTree', function(state, $compile) {
  return {
    restrict: 'A',
    scope: {
      tokens: '=',
      styles: '='
    },
    link: function(scope, element, attrs) {
      // This will be needed once we manage to get this into an isolated scope
      //scope.state = state;

      function tokenPlaceholder(token) {
        return '<div class="node" id="tph' + token.id + '">' + token.string + '</div>';
      }

      function edgePlaceholder(token) {
        var label = token.relation.label;
        var id = token.id;
        // tel is for token edge label
        return '<div id="tel' + id + '" class="tree-label">' + label + '</div>';
      }

      function tokenHasCustomStyling(token) {
        var t = scope.styles[token.id] || {};
        return t.token;
      }

      function applyTokenStyling(childScope, token) {
        childScope.style = scope.styles[token.id].token;
      }

      // Struggling d3 a bit here...
      //
      // Right now this function is responsible for managing the label and
      // edge colors when a custom styling is available.
      //
      // Once the relation plugin is ready, the label will be handled by
      // a directive that is coming from there.
      //
      // The edges will stay the responsibility of this directive - and
      // they are really solved messy right now.
      // Guess one more look into the d3 API is needed.
      function applyCustomStyling() {
        var edges = vis.selectAll("g.edgePath path");
        angular.forEach(scope.styles, function(value, key) {
          if ('label' in value) {
            vis.select('#tel' + key).style({ color: 'red' });
          }
          if ('edge' in value) {
            edges.each(function(d) {
              if (key == d) {
                angular.element(this).css({ 'stroke': 'red', 'stroke-width': '1px' });
              }
            });
          }
        });
      }

      function compiledToken(token) {
        var childScope = scope.$new();
        childScope.token = token;

        // Ugly but working...
        // We replace the colorize value in our token template string.
        // If custom styles are given, we check if one is available for
        // this token. If yes, we use it, otherwise we just pass one
        // undefined which leaves the token unstyled.
        //
        // Without custom styles we let the token itself decide what color
        // it has.
        var style;
        if (scope.styles) {
          if (tokenHasCustomStyling(token)) {
            applyTokenStyling(childScope, token);
          } // else we just stay undefined
          style = 'style';
        } else {
          style = 'true';
        }
        return $compile(tokenHtml.replace('STYLE', style))(childScope)[0];
      }

      var tokenHtml = '\
        <span\
          token="token"\
          colorize="STYLE"\
          click="true"\
          hover="true">\
        </span>\
      ';

      // Creating the node set

      // g will hold the graph and be set when new tokens are loaded,
      // vis will be it's d3 representation
      var g;
      var vis;

      function createNodes() {
        g.addNode("0000", { label: "[-]"});
        angular.forEach(scope.tokens, function(token, index) {
          g.addNode(token.id, { label: tokenPlaceholder(token) });
        });
      }

      function createEdges() {
        angular.forEach(scope.tokens, function(token, index) {
          if (token.head) {
            drawEdge(token);
          }
        });
      }

      function edges() {
        return vis.selectAll("g.edgePath path");
      }

      function nodes() {
        return vis.selectAll("div.node");
      }

      function drawEdge(token) {
        g.addEdge(token.id, token.id, token.head.id, { label: edgePlaceholder(token) });
      }

      function updateEdge(token) {
        g.delEdge(token.id);
        drawEdge(token);
      }

      function resetEdgeStyling() {
        edges().style({ stroke: '#333', 'stroke-width': '0.5px' });
      }

      function createGraph() {
        g = new dagreD3.Digraph();
        createNodes();
        createEdges();
        render();
      }

      // Initialize the graph

      var layout = dagreD3.layout().rankDir("BT");
      var svg = d3.select(element[0]);
      svg.call(d3.behavior.zoom().on("zoom", function() {
         var ev = d3.event;
         svg.select("g")
           .attr("transform",
                 "translate(" + ev.translate + ") scale(" + ev.scale + ")");
      }));

      var renderer = new dagreD3.Renderer();

      function render() {
        vis = svg.select('g');
        renderer.layout(layout).run(g, vis);

        // Customize the graph so that it holds our directives

        nodes().append(function() {
          // This is the element we append to and we created as a placeholder
          // We clear out its text content so that we can display the content
          // of our compiled token directive.
          // The placholder has an id in the format of tphXXXX where XXXX is the id.
          this.textContent = "";
          return compiledToken(scope.tokens[this.id.slice(3)]);
        });

        // Not very elegant, but we don't want marker-end arrowheads right now
        edges().attr('marker-end', '');
      }

      angular.forEach(scope.tokens, function(token, id) {
        var childScope = scope.$new();
        childScope.token = token.id;
        childScope.head =  token.head;
        childScope.$watch('head.id', function(newVal, oldVal) {
          // Very important to do here, otherwise the tree will
          // be render a little often on startup...
          if (newVal !== oldVal) {
            updateEdge(token);
            render();
          }
        });
      });

      scope.$watch('tokens', function(newVal, oldVal) {
        createGraph();
      });

      scope.$watch('styles', function(newVal, oldVal) {
        if (newVal !== oldVal) {
          render();
          if (newVal) {
            applyCustomStyling();
          } else {
            resetEdgeStyling();
          }
        }
      });
    },
    template: '<g transform="translate(20,20)"/>'
  };
});
