"use strict";

/* global dagreD3 */
angular.module('arethusa.core').factory('Tree', [
  '$compile',
  'languageSettings',
  'keyCapture',
  'idHandler',
  '$window',
  'state',
  '$timeout',
  'translator',
  'plugins',
  'navigator',
  function ($compile, languageSettings, keyCapture, idHandler, $window,
            state, $timeout, translator, plugins, navigator) {
    return function(scope, element, conf) {
      var self = this;

      // General margin value so that trees don't touch the canvas border.
      var treeMargin = 15;

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
        <svg class="full-height full-width">\
          <g transform="translate(' + treeMargin + ',' + treeMargin + ')"/>\
        </svg>\
      ';
      var tree = angular.element(treeTemplate);

      // Common duration for all transitions of the graph
      var transitionDuration = 700;


      // Values for the synthetic root node on top of the dependency tree
      var rootText = "[ROOT]";
      var rootId;

      // This function will be used to store special function that can move
      // and resize the tree, such as a perfectWidth mode. If this function
      // is set resize events of the window or direction changes of the tree
      // will trigger it.
      var viewModeFn;

      // Will contain the dagreD3 graph, including all nodes, edges and label.
      this.g = undefined;

      // The g element contained in the svg canvas.
      this.vis = undefined;

      // The svg itself.
      var svg = d3.select(element[0]);

      // Introspective variables about the tree canvas
      var height, width, xCenter, yCenter;

      // d3 object responsible for zooming and dragging
      var zoomer = d3.behavior.zoom();

      // Register listener for zooming and dragging.
      //
      // Add scale boundaries so that a user cannot go to unreasonable
      // zoom levels.
      svg.call(zoomer.on('zoom', zoomAndDrag).scaleExtent([0.3, 2.5]));

      // Zoom and Drag function
      //
      // Unsets viewModeFn: When a user wants to a focus on a particular area
      // we don't want to use automatic resizings and movements.
      function zoomAndDrag() {
        unsetViewModeFn();
        var ev, val;
        ev  = d3.event;
        val = 'translate(' + ev.translate + ') scale(' + ev.scale + ')';
        self.vis.attr('transform', val);
      }

      // dagre renderer
      var renderer = new dagreD3.Renderer();

      // Use transitions for all movements inside the graph
      renderer.transition(function(selection) {
        return selection.transition().duration(transitionDuration);
      });

      // control variable for show/hide status of the tree's settings panel
      scope.settingsOn = false;


      // Templates to be compiled in the course of this directive
      function rootTokenHtml() {
        return '<span root-token root-id="' + rootId + '" sentence-id="' + inferSentenceId() + '">' +
          rootText +
        '</span>';
      }

      var tokenHtml = '\
        <span token="token"\
          style="white-space: nowrap"\
          class="no-transition"\
          colorize="STYLE"\
          click="true"\
          hover="true"/>\
      ';

      var edgeLabelTemplate = '\
        <span\
         value-watch\
         target="obj"\
         property="label"\
         empty-val="NIL"/>\
      ';

      // Templates driven out to their own files
      function templatePath(name) {
        return "templates/arethusa.dep_tree/" + name + ".html";
      }

      function prependTemplate(template) {
        var el = '<span class="right" ng-include="' + template + '"/>';
        angular.element(element[0].previousElementSibling).append($compile(el)(scope));
      }

      scope.panelTemplate = templatePath('settings');


      // Placeholder values during the intial drawing phase of the tree.
      // They will get replaced by fully functional directives afterwards.
      //
      // Needed so that properly sized boxed inside the graph are accessible.
      function rootPlaceholder() {
        return '<div id="tph' + rootId + '">' + rootText + '</div>';
      }

      function tokenPlaceholder(token) {
        return '<div class="node token-node" id="tph' + token.id + '">' + token.string + '</div>';
      }

      function labelPlaceholder(token) {
        var label = 'xxxxxxxxxxx';
        var id = token.id;
        var classes = 'text-center tree-label';
        return '<div id="' + labelId(id) + '" class="' + classes + '">' + label + '</div>';
      }

      // Compile functions
      //
      // Their return values will be inserted into
      // the tree and replace the placeholders.
      function compiledEdgeLabel(token) {
        var childScope = scope.$new();
        self.childScopes.push(childScope);
        childScope.obj = token.relation;
        return $compile(edgeLabelTemplate)(childScope)[0];
      }

      function compiledToken(token) {
        var childScope = scope.$new();
        self.childScopes.push(childScope);
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

      // Styling functions
      // Responsible for formatting edges with a custom styling
      //
      // If an edge style is overridden, we safe the old value in the
      // styleResets object. the resetEdgeStyling() function will now
      // how to operate with this then.
      function tokenHasCustomStyling(token) {
        var t = scope.styles[token.id] || {};
        return t.token;
      }

      function applyTokenStyling(childScope, token) {
        childScope.style = scope.styles[token.id].token;
      }

      var edgeStyleResets = {};
      var labelStyleResets = {};
      function applyCustomStyling() {
        var edges = self.vis.selectAll('g.edgePath path');
        angular.forEach(scope.styles, function (style, id) {
          var labelStyle = style.label;
          var edgeStyle = style.edge;
          if (labelStyle) {
            saveOldStyles(id, label(id), labelStyle, labelStyleResets);
            label(id).style(labelStyle);
          }
          if (edgeStyle) {
            saveOldStyles(id, edge(id), edgeStyle, edgeStyleResets);
            edge(id).style(edgeStyle);
          }
        });
      }

      function saveOldStyles(id, el, properties, resets) {
        if (properties) {
          var style = {};
          angular.forEach(properties, function (_, property) {
            style[property] = el.style(property);
          });
          resets[id] = style;
        }
      }

      function resetEdgeStyling() {
        angular.forEach(edgeStyleResets, function (style, id) {
          edge(id).style(style);
        });
        edgeStyleResets = {};  // clean up, to avoid constant resetting
      }

      function resetLabelStyling() {
        angular.forEach(labelStyleResets, function (style, id) {
          label(id).style(style);
        });
        labelStyleResets = {};  // clean up, to avoid constant resetting
      }

      // Getter functions for nodes, labels, edges,  generators for
      // properly namespaced ids and query methods for these elements.
      function edges() {
        return self.vis.selectAll('g.edgePath path');
      }
      function edge(id) {
        return self.vis.select('#' + edgeId(id));
      }
      function edgePresent(id) {
        return edge(id)[0][0];  // yes, that's valid d3 syntax
      }
      function edgeId(id) {
        return 'tep' + id;
      }
      function label(id) {
        return self.vis.select('#' + labelId(id));
      }
      function labelId(id) {
        return 'tel' + id;
      }
      function nodeId(id) {
        return 'tph' + id;
      }
      function node(id) {
        return self.vis.select('#' + nodeId(id));
      }
      function nodes() {
        return self.vis.selectAll('div.node');
      }
      function tokenNodes() {
        return self.vis.selectAll('div.node.token-node');
      }

      // A bug in webkit makes it impossible to select camelCase tags...
      // We work around by using a function.
      // http://stackoverflow.com/questions/11742812/cannot-select-svg-foreignobject-element-in-d3
      function foreignObjects() {
        return self.vis.selectAll(function () {
          return this.getElementsByTagName('foreignObject');
        });
      }

      function nodePresent(id) {
        return self.g._nodes[id];
      }
      function hasHead(token) {
        return aU.getProperty(token, conf.mainAttribute);
      }

      function stillSameTree(a, b) {
        if (a && b) {
          return angular.equals(Object.keys(a), Object.keys(b));
        }
      }


      // Functions to create, update and render the graph
      //
      // They are solely called by watches.

      // REVIEW plugin is not able to use this well right now - need to refactor
      function createGraph(noRegroup) {
        if (isMainTree()) {
          if (!noRegroup) groupTokens();
          var oldTree = scope.current;
          scope.current = scope.groupedTokens[scope.currentFocus];

          if (stillSameTree(scope.current, oldTree)) return;
        } else {
          scope.current = scope.tokens;
        }

        clearOldGraph();
        self.g = new dagreD3.Digraph();
        if (conf.syntheticRoot) createRootNode();
        createEdges();
        render();
      }

      function groupTokens() {
        scope.groupedTokens = aU.map(navigator.currentSentences, 'tokens');
        scope.groupSize = scope.groupedTokens.length;
      }

      function clearOldGraph() {
        if (self.vis) self.vis.selectAll('*').remove();
      }

      function inferSentenceId() {
        for (var first in scope.current) break;
        return scope.current[first].sentenceId;
      }

      function createRootNode() {
        rootId = idHandler.getId('0', inferSentenceId());
        self.g.addNode(rootId, { label: rootPlaceholder() });
      }
      function createNode(token) {
        self.g.addNode(token.id, { label: tokenPlaceholder(token) });
      }
      function createEdges() {
        angular.forEach(scope.current, function (token, index) {
          if (hasHead(token)) self.drawEdge(token);
        });
      }

      // This function serves dependencyTrees and can be overriden
      // for other usages.
      this.drawEdge = function drawEdge(token) {
        var id = token.id;

        // This is a hack - we have some troubles here on
        // tokenRemoved events which I don't really understand -
        // can't think of a scenario where a token without an id
        // comes in here. It's actually a token that has just a
        // single property (head) - really have no clue.
        //
        // This prevents it, but the root cause for this needs to
        // be investigated.
        if (!angular.isDefined(id)) return;

        var headId = aU.getProperty(token, conf.mainAttribute);

        if (!nodePresent(id)) {
          createNode(token);
        }

        if (!nodePresent(headId)) {
          createNode(scope.current[headId]);
        }
        self.g.addEdge(id, id, headId, { label: labelPlaceholder(token) });
      };

      function updateEdge(token) {
        if (edgePresent(token.id)) {
          self.g.delEdge(token.id);
        }
        self.drawEdge(token);
      }

      function destroy(childScope) {
        childScope.$destroy();
      }

      function clearChildScopes() {
        angular.forEach(self.childScopes, destroy);
        self.childScopes = [];
      }

      function customizeGraph() {
        // Customize the graph so that it holds our directives
        clearChildScopes();
        if (conf.syntheticRoot) insertRootDirective();
        self.insertNodeDirectives();
        self.insertEdgeDirectives();
      }

      function render() {
        self.vis = svg.select('g');
        renderer.layout(scope.layout).run(self.g, self.vis);
        customizeGraph();

        // Not very elegant, but we don't want marker-end arrowheads right now
        // We also place an token edge path (tep) id on these elements, so that
        // we can access them more easily later on.
        edges().each(function (id) {
          angular.element(this).attr('id', edgeId(id));
        }).attr('marker-end', '');

        var foreignObjs = foreignObjects();
        foreignObjs.each(function () {
          angular.element(this.children[0]).attr('style', 'float: center;');

          // The content of the foreignObject element can overflow its bounding
          // box, which would lead to clipped display.
          // its SVG box.
          angular.element(this).attr('overflow', 'visible');
        });

        // Reactivate Transitions - as we recompile the token directives during
        // render, we deactivated the color transition temporarily to avoid
        // color flickering.
        // Has to be timeouted (which means running after the current $digest),
        // as otherwise we wouldn't be able to find the freshly appended tokens
        // through a selector.
        $timeout(function() {
          element.find('.token').removeClass('no-transition');
        });
      }

      function insertRootDirective() {
        node(rootId).append(function() {
          this.textContent = '';
          return $compile(rootTokenHtml())(scope)[0];
        });
      }

      function insertNodeDirectives() {
        self.insertTokenDirectives();
      }

      function insertTokenDirectives() {
        tokenNodes().append(function () {
          // This is the element we append to and we created as a placeholder
          // We clear out its text content so that we can display the content
          // of our compiled token directive.
          // The placholder has an id in the format of tphXXXX where XXXX is the id.
          this.textContent = '';
          return compiledToken(scope.current[this.id.slice(3)]);
        });
      }

      function insertEdgeDirectives() {
        angular.forEach(scope.current, function (token, id) {
          label(id).append(function () {
            this.textContent = '';
            var label = compiledEdgeLabel(token);
            return label;
          });
        });
      }

      // Tree manipulations
      //
      // Change the trees layout, position and size

      function compactTree() {
        scope.nodeSep = 30;
        scope.edgeSep = 10;
        scope.rankSep = 30;
      }

      function wideTree () {
        scope.nodeSep = 80;
        scope.edgeSep = 5;
        scope.rankSep = 40;
      }

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

      scope.centerGraph = function() {
        setViewModeFn(scope.centerGraph);
        var xPos = (width - graphSize().width) / 2;
        moveGraph(xPos, treeMargin);
      };

      scope.perfectWidth = function() {
        setViewModeFn(scope.perfectWidth);
        var gWidth  = graphSize().width;
        var targetW = width - treeMargin * 2;
        var scale = targetW / gWidth;
        moveGraph(treeMargin, treeMargin, scale);
      };

      scope.focusRoot = function() {
        setViewModeFn(scope.focusRoot);
        focusNode(rootId);
      };

      scope.focusSelection = function() {
        setViewModeFn(scope.focusSelection);
        focusNode(state.firstSelected(), height / 3);
      };

      function sortRankByIdAscending() {
        var langSettings = languageSettings.getFor('treebank');
        return langSettings ? langSettings.leftToRight : true;
      }

      function moveGraph(x, y, sc) {
        syncZoomAndDrag(x, y, sc);
        var translate = 'translate(' + x + ',' + y +' )';
        var scale = sc ? ' scale(' + sc+ ')' : '';
        self.vis.transition()
          .attr('transform', translate + scale)
          .duration(transitionDuration)
          .ease();
      }

      function focusNode(id, offset) {
        if (id) {
          offset = offset || treeMargin;
          var nodePos = nodePosition(id);
          var newX = xCenter - nodePos.x;
          var newY = 0 - nodePos.y + offset;
          moveGraph(newX, newY);
        }
      }

      // We have saved our d3 zoom behaviour in a variable. The offsets
      // need to be updated manually when we do transformations by hand!
      function syncZoomAndDrag(x, y, scale) {
        zoomer.translate([x, y]);
        zoomer.scale(scale || 1);
      }

      function graphSize() {
        return self.vis.node().getBBox();
      }

      function calculateSvgHotspots() {
        width   = tree.width();
        height  = tree.height();
        xCenter = width  / 2;
        yCenter = height / 2;
      }

      function Point(x, y) {
        this.x = x;
        this.y = y;
      }

      function parseTransformTranslate(node) {
        var translate = node.attr('transform');
        var match = /translate\((.*),(.*?)\)/.exec(translate);
        return new Point(match[1], match[2]);
      }

      function nodePosition(id) {
        var n = angular.element(node(id)[0]);
        return parseTransformTranslate(n.parents('.node'));
      }



      // Functions for automated tree movements
      function applyViewMode() {
        if (angular.isDefined(viewModeFn)) {
          viewModeFn();
        }
      }

      function setViewModeFn(fn) {
        viewModeFn = fn;
      }

      function unsetViewModeFn() {
        viewModeFn = undefined;
      }

      function moveToStart() {
        if (graphSize().width > width - treeMargin * 2) {
          scope.perfectWidth();
        } else {
          scope.centerGraph();
        }
      }


      // Watches and Event listeners

      function init(noRegroup) {
        createGraph(noRegroup);
        moveToStart();
        if (isMainTree()) plugins.declareReady(conf.parentPlugin);
      }

      scope.$watch('styles', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          customizeGraph();
          if (newVal) {
            applyCustomStyling();
          } else {
            resetEdgeStyling();
            resetLabelStyling();
          }
        }
      });

      // Settings watches
      var watches = {
        'nodeSep': function(newVal) { scope.layout.nodeSep(newVal); },
        'edgeSep': function(newVal) { scope.layout.edgeSep(newVal); },
        'rankSep': function(newVal) { scope.layout.rankSep(newVal); },
        'rankDir': function(newVal) { scope.layout.rankDir(newVal); },
        'textDirection': function(newVal) { scope.layout.sortRankByIdAscending(newVal); }
      };

      angular.forEach(watches, function(fn, attr) {
        scope.$watch(attr, function(newVal, oldVal) {
          if (newVal !== oldVal) {
            fn(newVal);
            render();
            // We need to timeout this call. The render() function uses
            // a transition as well. D3 transitions work with keyframes -
            // if we call our method during the start and end frame, we
            // will not get the values we want when we call for the size
            // of the new graph (and all viewMode functions operate on
            // them, because they will be built gradually against the
            // end keyframe. We therefore wait until the end of this
            // transition before we do the next move.
            $timeout(applyViewMode, transitionDuration);
          }
        });
      });

      function isMainTree() {
        return scope.tokens === state.tokens;
      }

      function inActiveTree(id) {
        return scope.current[id];
      }

      function isDisconnected(val) {
        // The new head value might be undefined or set to an
        // empty string to indicate disconnection.
        return !(angular.isDefined(val) && val !== "");
      }

      // only do this if we are the main tree!
      if (isMainTree()) {
        state.on('tokenAdded', function(event, token) {
          if (inActiveTree(token.id)) {
            createNode(token);
            customizeGraph();
            render();
          }
        });

        state.on('tokenRemoved', function(event, token) {
          var id = token.id;
          if (inActiveTree(id) && nodePresent(id)) {
            self.g.delNode(id);
            render();
          }
        });

        // Listen for batch changes - when one, which we are interested
        // in, is in progress, we wait for its end to re-render the tree
        // only once and not several times for each head change.
        var queuedChangesPresent;
        state.watch(conf.mainAttribute, function(newVal, oldVal, event) {
          var token = event.token;
          if (inActiveTree(token.id)) {
            // Very important to do here, otherwise the tree will
            // be render a little often on startup...
            if (newVal !== oldVal) {
              // If a disconnection has been requested, we just
              // have to delete the edge and do nothing else
              if (isDisconnected(newVal)) {
                self.g.delEdge(token.id);
              } else {
                updateEdge(token);
              }
            }
            if (state.batchChange) {
              queuedChangesPresent = true;
              return;
            }

            render();
            $timeout(applyViewMode, transitionDuration);
          }
        });

        state.on('batchChangeStop', function() {
          if (queuedChangesPresent) {
            render();
            $timeout(applyViewMode, transitionDuration);
            queuedChangesPresent = false;
          }
        });
      }

      angular.element($window).on('resize', function() {
        calculateSvgHotspots();
        applyViewMode();
      });


      // Keybindings for this directive
      function keyBindings(kC) {
        return {
          tree: [
            kC.create('directionChange', function() { scope.changeDir(); }, 'x'),
            kC.create('centerTree', function() { scope.centerGraph(); }, 's'),
            kC.create('focusRoot', function() { scope.focusRoot(); }),
            kC.create('focusSelection', function() { scope.focusSelection(); }, 'a'),
            kC.create('perfectWidth', function() { scope.perfectWidth(); }, 'd'),
          ]
        };
      }


      function setLayout() {
        scope.compactTree = self.compactTree;
        scope.wideTree = self.wideTree;

        scope.textDirection = sortRankByIdAscending();
        scope.rankDir = 'BT';
        if (conf.direction === 'vertical') scope.changeDir();

        scope.compactTree();
        scope.layout = dagreD3.layout()
          .sortRankByIdAscending(scope.textDirection)
          .rankDir(scope.rankDir)
          .nodeSep(scope.nodeSep)
          .edgeSep(scope.edgeSep)
          .rankSep(scope.rankSep);
      }

      function start() {
        setLayout();

        // This watch is responsible for firing up the directive
        scope.currentFocus = 0;

        scope.$watch('tokens', function() { init(); } );

        scope.$watch('currentFocus', function(newVal, oldVal) {
          if (newVal !== oldVal) init(true);
        });

        checkBorderStyle();

        // Append and prepend all templates
        element.append(tree);
        prependTemplate('panelTemplate');
        element.prepend($compile('<div dep-tree-navigator/>')(scope));

        // Initialize some more starting values
        calculateSvgHotspots();
      }


      // This is a dirty hack for backwards compatibility of
      // commonly used layouts. We don't want the tree bordered
      // all the time. Can go away once we move on to the Grid
      // as main layout.
      var canvas = element.parents('.tree-canvas');
      function checkBorderStyle() {
        if (isPartOfGrid() || isPartOfSidepanel()) {
          canvas.addClass('no-border');
        } else {
          canvas.removeClass('no-border');
        }
      }

      var keys = keyCapture.initCaptures(keyBindings);

      scope.keyHints = arethusaUtil.inject({}, keys.tree, function(memo, name, key) {
        memo[name] = arethusaUtil.formatKeyHint(key);
      });

      scope.$on('$destroy', keys.$destroy);

      scope.translations = {};
      var translateValues = [
        'changeDir', 'focusRoot', 'focusSel', 'centerTree',
        'perfectWidth', 'compact', 'widen'
      ];
      angular.forEach(translateValues, function(val, i) {
        translator('tree.' + val, scope.translations, val);
      });

      function grid() { return element.parents('.gridster'); }
      function isPartOfGrid() { return grid().length; }
      function gridReady() { return grid().hasClass('gridster-loaded'); }

      function sidepanel() { return element.parents('#sidepanel'); }
      function isPartOfSidepanel() { return sidepanel().length; }

      // Special handling for an edge case:
      // When we change the layout which uses this directive on the fly
      // to a grid based one, we need to wait a little, so that the grid
      // item which holds our tree has the correct size, otherwise our
      // tree will render too little (where too little could also mean
      // with a width of 0...)
      this.launch = function() {
        if (isPartOfGrid() && !gridReady()) {
          $timeout(start, 130);
        } else {
          start();
        }
      };

      // Functions to be overridden by directives that use this
      function noop() {}

      this.createEdges = noop;
      this.nodePresent = nodePresent;
      this.createNode  = createNode;
      this.insertNodeDirectives  = insertNodeDirectives;
      this.insertTokenDirectives = insertTokenDirectives;
      this.insertEdgeDirectives  = insertEdgeDirectives;

      this.compactTree = compactTree;
      this.wideTree = wideTree;

      this.childScopes = [];
    };
  }
]);
