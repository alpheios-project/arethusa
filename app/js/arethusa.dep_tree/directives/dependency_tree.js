'use strict';
/* Draws a dependencyTree
 *
 * Can be used in isolation and awaits tokens passed into it, which have
 * a head.id property.
 *
 * The directive needs to be set on an svg element as attribute.
 *
 * Styling of the tree can be customized by passing a styles object as
 * attribute.
 * This object should be a dictionary of token ids with style information
 * in three categories: edge, label and token.
 * These properties should hold regular css style information. Example
 *
 *   {
 *     '0001' : {
 *       edge: { stroke: 'blue' },
 *       token: { color: 'white' }
 *     }
 *   }
 *
 * This would draw the edge of the token 0001 one blue and the textual
 * representation of the token itself in white.
 *
 * Tokens are rendered by the token directive. If no styles object has
 * been passed to the dependencyTree directive, the token itself will
 * decide its styling.
 * Hover and click events for tokens are activated. An option to customize
 * this will follow.
 *
 * Watches are in effect for changes of a tokens head.id value, changes
 * in the styles object, as well as in the tokens object.
 *
 * Example, given a tokens and a styles object in the current scope:
 *
 *   <svg dependency-tree tokens="tokens" styles="styles/>
 *
 */
/* global dagreD3 */
angular.module('arethusa.depTree').directive('dependencyTree', [
  '$compile',
  'languageSettings',
  'keyCapture',
  'idHandler',
  '$window',
  function ($compile, languageSettings, keyCapture, idHandler, $window) {
    return {
      restrict: 'A',
      scope: {
        tokens: '=',
        styles: '='
      },
      link: function (scope, element, attrs) {
        // We don't use a template in this directive on purpose and
        // append our tree to the element. This way a view can create
        // wrapping elements around the tree, where information about
        // the tree can be displayed. This space is also the place
        // where the tree settings can be triggered.
        //
        // It's imperative that appending the svg is the first action
        // inside this directive, otherwise it would fail: The link
        // function already works with this element - so it needs to be
        // there before any other computations can be made.
        //
        // The svg element is held in a variable. This is one step closer
        // to create independent subtrees (as individual g elements)!
        var treeTemplate = '\
          <svg class="tree-canvas full-height full-width">\
            <g transform="translate(20, 20)"/>\
          </svg>\
        ';
        var tree = angular.element(treeTemplate);

        element.append(tree);

        var rootText = "[ROOT]";
        var rootId = idHandler.getId('0');

        function rootPlaceholder() {
          return '<div id="tph' + rootId + '">' + rootText + '</div>';
        }

        function tokenPlaceholder(token) {
          return '<div class="node" id="tph' + token.id + '">' + token.string + '</div>';
        }
        function labelPlaceholder(token) {
          //var label = generateLabel(token);
          var label = 'xxxxxxxxxxx';
          var id = token.id;
          var classes = 'text-center tree-label';
          return '<div id="' + labelId(id) + '" class="' + classes + '">' + label + '</div>';
        }
        function generateLabel(token) {
          return (token.relation || {}).label;
        }
        function tokenHasCustomStyling(token) {
          var t = scope.styles[token.id] || {};
          return t.token;
        }
        function applyTokenStyling(childScope, token) {
          childScope.style = scope.styles[token.id].token;
        }
        // Right now this function is responsible for managing the label and
        // edge colors when a custom styling is available.
        //
        // Once the relation plugin is ready, the label will be handled by
        // a directive that is coming from there.
        //
        // The directive will only stay responsible for the edges.
        //
        // If an edge style is overridden, we safe the old value in the
        // styleResets object. the resetEdgeStyling() function will now
        // how to operate with this then.
        var styleResets = {};
        function applyCustomStyling() {
          var edges = vis.selectAll('g.edgePath path');
          angular.forEach(scope.styles, function (style, id) {
            var labelStyle = style.label;
            var edgeStyle = style.edge;
            if (labelStyle) {
              label(id).style(labelStyle);
            }
            if (edgeStyle) {
              saveOldEdgeStyles(id, edgeStyle);
              edge(id).style(edgeStyle);
            }
          });
        }
        function saveOldEdgeStyles(id, properties) {
          if (properties) {
            var e = edge(id);
            var style = {};
            angular.forEach(properties, function (_, property) {
              style[property] = e.style(property);
            });
            styleResets[id] = style;
          }
        }
        function compiledEdgeLabel(token) {
          var template = '<span value-watch target="obj" property="label"></span>';
          var childScope = scope.$new();
          childScope.obj = token.relation;
          return $compile(template)(childScope)[0];
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
            }
            // else we just stay undefined
            style = 'style';
          } else {
            style = 'true';
          }
          return $compile(tokenHtml.replace('STYLE', style))(childScope)[0];
        }
        var tokenHtml ='<span token="token" colorize="STYLE" click="true" hover="true"/>';
        var rootTokenHtml = '<span root-token>' + rootText + '</span>';

        // Creating the node set
        // g will hold the graph and be set when new tokens are loaded,
        // vis will be it's d3 representation
        var g;
        var vis;
        function createRootNode() {
          g.addNode(rootId, { label: rootPlaceholder() });
        }
        function createNode(token) {
          g.addNode(token.id, { label: tokenPlaceholder(token) });
        }
        function nodePresent(id) {
          return g._nodes[id];
        }
        function hasHead(token) {
          return (token.head || {}).id;
        }
        function createEdges() {
          angular.forEach(scope.tokens, function (token, index) {
            if (hasHead(token)) {
              drawEdge(token);
            }
          });
        }
        function edges() {
          return vis.selectAll('g.edgePath path');
        }
        function edge(id) {
          return vis.select('#' + edgeId(id));
        }
        function edgePresent(id) {
          return edge(id)[0][0];  // yes, that's valid d3 syntax
        }
        function edgeId(id) {
          return 'tep' + id;
        }
        function label(id) {
          return vis.select('#' + labelId(id));
        }
        function labelId(id) {
          return 'tel' + id;
        }
        function nodeId(id) {
          return 'tph' + id;
        }
        function node(id) {
          return vis.select('#' + nodeId(id));
        }
        function nodes() {
          return vis.selectAll('div.node');
        }
        function drawEdge(token) {
          if (!nodePresent(token.id)) {
            createNode(token);
          }
          if (!nodePresent(token.head.id)) {
            createNode(scope.tokens[token.head.id]);
          }
          g.addEdge(token.id, token.id, token.head.id, { label: labelPlaceholder(token) });
        }
        function updateEdge(token) {
          if (edgePresent(token.id)) {
            g.delEdge(token.id);
          }
          drawEdge(token);
        }
        function resetEdgeStyling() {
          angular.forEach(styleResets, function (style, id) {
            edge(id).style(style);
          });
          styleResets = {};  // clean up, to avoid constant resetting
        }
        function createGraph(subtrees) {
          g = new dagreD3.Digraph();
          createRootNode();
          createEdges();
          render();
        }
        // Initialize the graph
        scope.compactTree = function() {
          scope.nodeSep = 30;
          scope.edgeSep = 10;
          scope.rankSep = 30;
        };

        scope.wideTree = function() {
          scope.nodeSep = 80;
          scope.edgeSep = 5;
          scope.rankSep = 40;
        };
        scope.changeDir = function() {
          var horDir;
          if (sortRankByIdAscending()) {
            horDir = "RL";
          } else {
            horDir = "LR";
            scope.textDirection = !scope.textDirection;
          }
          scope.rankDir = scope.rankDir === "BT" ? horDir : "BT";
        };

        function sortRankByIdAscending() {
          var langSettings = languageSettings.getFor('treebank');
          return langSettings ? langSettings.leftToRight : true;
        }

        scope.textDirection = sortRankByIdAscending();

        scope.rankDir = 'BT';
        scope.compactTree();

        scope.layout = dagreD3.layout()
          .sortRankByIdAscending(scope.textDirection)
          .rankDir(scope.rankDir)
          .nodeSep(scope.nodeSep)
          .edgeSep(scope.edgeSep)
          .rankSep(scope.rankSep);

        var svg = d3.select(element[0]);
        svg.call(d3.behavior.zoom().on('zoom', function () {
          var ev = d3.event;
          svg.select('g').attr('transform', 'translate(' + ev.translate + ') scale(' + ev.scale + ')');
        }).scaleExtent([0.3, 2.5]));
        var renderer = new dagreD3.Renderer();

        function transition(selection) {
          return selection.transition().duration(700);
        }
        renderer.transition(transition);

        function moveGraph(x, y) {
          vis.attr('transform', 'translate(' + x + ',' + y +' )');
        }

        // Prepend focus controls
        scope.focusRoot = function() {
          var rootPos = nodePosition(rootId);
          var newX = xCenter - rootPos.x;
          moveGraph(newX, 20);
        };
        element.prepend($compile('<span class="clickable flash-on-hover note" ng-click="focusRoot()">Focus</span>')(scope));

        var xCenter;
        var yCenter;
        function calculateSvgHotspots() {
          var w = tree.width();
          var h = tree.height();
          xCenter = w / 2;
          yCenter = h / 2;
        }

        function Point(x, y) {
          this.x = x;
          this.y = y;
        }

        function nodePosition(id) {
          var n = angular.element(node(id)[0]);
          var translate = n.parents('.node').attr('transform');
          var match = /translate\((.*),(.*)\)/.exec(translate);
          return new Point(match[1], match[2]);
        }

        // Prepend Tree settings panel
        scope.settingsOn = false;

        // We temporarily disable the fine-grained tree settings - they are a
        // little buggy.
            //<span title="rankSep" tree-setting="rankSep"></span>&nbsp;\
            //<span title="edgeSep" tree-setting="edgeSep"></span>&nbsp;\
            //<span title="nodeSep" tree-setting="nodeSep"></span>&nbsp;\
        scope.classForIcon = function() {
          return scope.settingsOn ? 'settings-triggered' : 'settings-trigger';
        };

        scope.panelTemplate = "templates/arethusa.dep_tree/settings.html";
        var panel = '<span ng-include="panelTemplate"/>';
        element.prepend($compile(panel)(scope));


        function insertRootDirective() {
          node(rootId).append(function() {
            this.textContent = '';
            return $compile(rootTokenHtml)(scope)[0];
          });
        }
        function insertTokenDirectives() {
          nodes().append(function () {
            // This is the element we append to and we created as a placeholder
            // We clear out its text content so that we can display the content
            // of our compiled token directive.
            // The placholder has an id in the format of tphXXXX where XXXX is the id.
            this.textContent = '';
            return compiledToken(scope.tokens[this.id.slice(3)]);
          });
        }
        function insertEdgeDirectives() {
          angular.forEach(scope.tokens, function (token, id) {
            label(id).append(function () {
              this.textContent = '';
              return compiledEdgeLabel(token);
            });
          });
        }
        function render() {
          vis = svg.select('g');
          renderer.layout(scope.layout).run(g, vis);
          // Customize the graph so that it holds our directives
          insertRootDirective();
          insertTokenDirectives();
          insertEdgeDirectives();

          // Not very elegant, but we don't want marker-end arrowheads right now
          // We also place an token edge path (tep) id on these elements, so that
          // we can access them more easily later on.
          edges().each(function (id) {
            angular.element(this).attr('id', edgeId(id));
          }).attr('marker-end', '');

          // A bug in webkit makes it impossible to select camelCase tags...
          // We work around by using a function.
          // http://stackoverflow.com/questions/11742812/cannot-select-svg-foreignobject-element-in-d3
          vis.selectAll(function () {
            return this.getElementsByTagName('foreignObject');
          }).each(function () {
            angular.element(this.children[0]).attr('style', 'float: center;');
          });
        }

        function createHeadWatches() {
          angular.forEach(scope.tokens, function (token, id) {
            var childScope = scope.$new();
            childScope.token = token.id;
            childScope.head = token.head;
            childScope.$watch('head.id', function (newVal, oldVal) { // Very important to do here, otherwise the tree will
              // be render a little often on startup...
              if (newVal !== oldVal) {
                // If a disconnection has been requested, we just
                // have to delete the edge and do nothing else
                if (newVal === "") {
                  g.delEdge(token.id);
                } else {
                  updateEdge(token);
                }
                render();
              }
            });
          });
        }

        scope.$watch('tokens', function (newVal, oldVal) {
          createGraph();
          moveGraph(20, 20);
          createHeadWatches();
        });
        scope.$watch('styles', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            render();
            if (newVal) {
              applyCustomStyling();
            } else {
              resetEdgeStyling();
            }
          }
        });

        // Settings watches
        var watches = {
          'nodeSep': function(newVal) { scope.layout.nodeSep(newVal); },
          'edgeSep': function(newVal) { scope.layout.edgeSep(newVal); },
          'edgeDir': function(newVal) { scope.layout.edgeDir(newVal); },
          'nodeDir': function(newVal) { scope.layout.nodeDir(newVal); },
          'rankDir': function(newVal) { scope.layout.rankDir(newVal); },
          'textDirection': function(newVal) { scope.layout.sortRankByIdAscending(newVal); }
        };

        angular.forEach(watches, function(fn, attr) {
          scope.$watch(attr, function(newVal, oldVal) {
            if (newVal !== oldVal) {
              fn(newVal);
              render();
            }
          });
        });

        angular.element($window).on('resize', calculateSvgHotspots);
        calculateSvgHotspots();

        keyCapture.initCaptures(function(kC) {
          return {
            tree: [
              kC.create('directionChange', function() { scope.changeDir(); })
            ]
          };
        });
      },
    };
  }
]);
