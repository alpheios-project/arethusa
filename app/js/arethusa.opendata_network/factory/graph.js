"use strict";

/* global SVGCurveLib */
angular.module('arethusa.opendataNetwork').factory('graph', [
  '$compile',
  'state',
  '$timeout',
  'keyCapture',
  function ($compile, state, $timeout, keyCapture) {
    /**
     * [description]
     * @param  {Object}  conf                      The configuration object for the graph
     * @param  {Object}  conf.colors               A key-value dictionary where the value represents the color to use for edges and the key the type value of an edge
     * @param  {Object}  conf.weight               A decreasing weight factor key-value dictionary where key represents edge's type and smallest numbers represents strongest connections 
     * @param  {Boolean} conf.edgeLabel            Show edges labels text by default
     * @param  {Boolean} conf.ontologyLabel        Split ontology edges labels around the colon.
     * @param  {Boolean} conf.mergeLinks           Merge together on the graph links between same nodes with same type
     * @param  {Boolean} conf.defaultEdgeLabel     The default edge label to display for editing or while edge labels are not displayed.
     * @return {function}         [description]
     */
    return function(scope, element, conf) {

      var self = this;

      self.configuration = conf || {};
      //if(!SVGCurveLib) { var SVGCurveLib; throw "SVG Curve Lib is not loaded"; }

      var computeMaxWeight = function() {
        var maxWeight = Object.keys(self.configuration.weight).map(function (key) {
            return self.configuration.weight[key];
        });
        self.configuration.maxWeight = Math.max.apply(null, maxWeight);
      };

      self.configuration.defaultColor = self.configuration.defaultColor || "#999";

      // General margin value so that trees don't touch the canvas border.
      var treeMargin = 15;
      var treeTemplate = '\
        <svg class="full-height full-width">\
          <g transform="translate(' + treeMargin + ',' + treeMargin + ')"/>\
        </svg>\
      ';
      var tree = angular.element(treeTemplate);
      var color = d3.scale.category20();

      var translateRegexp = new RegExp("([\-0-9]+), ([\-0-9]+)");

      //Scope informations
      scope.nodes = {};
      scope.links = [];
      scope.annotations = {};

      scope.graph = {
        nodes : [],
        links : []
      };

      scope.D3Params = {
        charge : -200,
        linkDistance : 100,
        running : false,
        translate : {
          x : 0,
          y : 0
        },
        scale : 1
      };

      /**
       * Compute link distance
       * @param  {Object} link   Graph's link object
       * @param  {Int}    index  Link's index in the array
       * @return {Int}           Link distance
       */
      var linkDistance = function(link, index) {
        return scope.D3Params.linkDistance * link.weight;
      };


      /**
       * Compute link charge
       * @param  {Object} link   Graph's link object
       * @param  {Int}    index  Link's index in the array
       * @return {Int}           Link charge
       */
      var linkCharge = function(link, index) {
        return scope.D3Params.charge * link.weight;
      };

      var tokenHtml = '\
          <span token="token"\
            style="white-space: nowrap;"\
            click="true"\
            hover="true"\
            />\
        ';
      var edgeHtml = '\
          <span open-data-edge edge="edge"\
            style="white-space: nowrap;"\
            click="true"\
            hover="true"\
            />\
        ';


      /**
       * Retrieve foreignObject elements
       * @return {HTMLCollection} Collection of foreignObject elements
       */
      var getForeignObject = function() {
        return self.svg.selectAll(function () {
          return this.getElementsByTagName('foreignObject');
        });
      };

      /**
       * Get Token placeholders
       * @return {HTMLCollection} Collection of nodes elements
       */
      var getTokenPlaceholders = function() {
        return self.svg.selectAll("div.node.token-node");
      };

      /**
       * Get Edge placeholders
       * @return {HTMLCollection} Collection of edges placeholder elements
       */
      var getEdgePlaceholders = function() {
        return self.svg.selectAll("div.edge.edge-node");
      };

      /**
       * Find a node in the graph according to its id
       * @param  {string}          id  Id of the node in the graph
       * @return {HTMLCollection}      Element representing the node
       */
      var getNodeById = function(id) {
        return self.svg.select('[data-node-id="' + id + '"]');
      };

      /**
       * Return the translate string for the middle of one rectangle
       * @param  {Object}  point   Representation of a point
       * @param  {Element} element Element for which we need to translate
       * @return {string}          Translate string for transform parameter in svg graph
       */
      var translateMiddle = function(point, element) {
        var w = 0,
            h = 0;
        try {
          w = element.children[0].width.baseVal.value;
          h = element.children[0].height.baseVal.value;
        } catch(e) {
          w = 0;
          h = 0;
        }
        return "translate(" + (point.x - w/2)  + "," + (point.y - h/2) + ")";
      };

      /**
       * Update the width of foreignObjects
       * @param {string} className Class to be retrieved
       */
      var updateWidth = function(className) {
        var foreigns = getForeignObject();
        foreigns.each(function(element, data, index) {
          var tph = this.getElementsByClassName(className);
          if(tph.length === 1) { // We have selected all foreigns objects, we need to filter that.
            tph = tph[0];
            this.setAttribute("width", tph.offsetWidth);
            this.setAttribute("height", tph.offsetHeight);
          }
        });
      };

      /**
       * Compile a token
       * @param  {Object} token A token object
       * @return {[type]}       [description]
       */
      var compiledToken = function (token) {
        var childScope = scope.$new();
        self.childScopes.push(childScope);
        childScope.token = token;
        return $compile(tokenHtml)(childScope)[0];
      };

      /**
       * Compile an edge directive
       * @param  {Object} token A token object
       * @return {[type]}       [description]
       */
      var compiledEdge = function (annotation) {
        var childScope = scope.$new();
        self.childScopes.push(childScope);
        childScope.edge = annotation;
        return $compile(edgeHtml)(childScope)[0];
      };

      /**
       * Check if a node representing the token exists
       * @param  {token|string} token Target Token
       * @return {boolean}            Indicator of existence
       */
      var nodeExists = function(token) {
        var id = (typeof token === "string") ? token : token.id;
        return (typeof scope.nodes[id] !== "undefined");
      };

      /*
        Watching tokens graph properties
       */
      state.watch("graph", function(newVal, oldVal, event) {
        var token = event.token;
        initiateGraph();
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
          if(links[i].source !== tokenId) {
            l.push(links[i]); 
          }
        }
        scope.links = l;
      };

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
        scope.links.push(link);
      };

      /**
       * Create a token in our dictionary
       * @param  {string} tokenId   ID of the Token to be created
       * @return {undefined}
       */
      var createToken = function(tokenId) {
        var token = state.getToken(tokenId);
        scope.nodes[token.id] = {
          name: token.string,
          token: token,
          id: token.id
        };
        return;
      };

      /**
       * Insert nodes into the graph
       * @param  {D3JSObject} node [description]
       */
      var insertNodes = function(node) {
        var foreignObjects = node
            .append("foreignObject")
            .attr("overflow", "visible")
            .attr("width", 10000) //We need to do that so divs take the right size
            .attr("height", 10000);

        // Because directives are compiled after, we play with a directive !
        var placeholders  = foreignObjects
          .append("xhtml:div")
          .html(function(d) {
            // Ids : Graph Token PlaceHolder
              return '<div class="node token-node placeholder" id="gtph' + d.token.id + '" style="display:inline;">' + d.token.string + '</div>';
          });

        updateWidth("token-node");

        var tokenDirectives = getTokenPlaceholders()
          .append(function() {
            // As we compiled html, we don't have any data inside this node.
            this.textContent = '';
            return compiledToken(scope.nodes[this.id.slice(4)].token);
          });
      };

      /**
       * Insert nodes into the graph
       * @param  {D3JSObject} root   Root of the graph
       * @param  {Object}     graph  Graph object
       * @return {Array}             List of elements which the graph will needs (g, textPath, foreignObjects)
       */
      var insertEdges = function(root, graph) {
        var r = [];
        var g = root.selectAll(".edgesLabels")
            .data(graph.links).enter()
            .append("g")
            //.attr("dy", ".35em")
            .attr("text-anchor", "middle");

        r.push(g);
          //In non editor mode, we show the label of each edge.
          var texts = g
            .append("text")
            .attr('text-anchor', 'middle');

          var textPath = texts
            .append("textPath")
            .attr("class", "edge edge-node placeholder")
            .attr("xlink:href", function(d) { return "#geph-path-" + d.id; })
            .attr("id", function(d) { return "geph" + d.id; })
            .style('font-size', '0.7em')
            .attr("startOffset", "25%")
            .text(function(d) {
              if(self.configuration.ontologyLabel) {
                var s = d.type.split(":");
                return (s.length == 2) ? s[1] : s;
              } else {
                return d.type;
              }
            });
        r.push(textPath);
        if(!self.configuration.viewer) {
          var foreignObjects = g
              .append("foreignObject")
              .attr("overflow", "visible")
              .attr("width", 10000) //We need to do that so divs take the right size
              .attr("height", 10000);

          // Because directives are compiled after, we play with a directive !
          var placeholders  = foreignObjects
            .append("xhtml:div")
            .style("display", "inline")
            .html(function(d) {
              // Ids : Graph Token PlaceHolder
                return '<div class="edge edge-node placeholder" id="geph' + d.id + '" style="display:inline;">' + self.configuration.defaultEdgeLabel + '</div>';
            });

          updateWidth("edge-node");

          var tokens = getEdgePlaceholders()
            .append(function() {
              // As we compiled html, we don't have any data inside this node.
              this.textContent = '';
              return compiledEdge(scope.annotations[this.id.slice(4)]);
            });
          r.push(foreignObjects);
        }
        return r;
      };

      /**
       * Update the scope.graph for D3
       * @return {Object} Object corresponding to a force graph 
       */
      var upgradeGraph = function() {
        var n = {},
            graph = {
              nodes : [],
              links : []
            },
            links = scope.links.slice(),
            existing = {};

        scope.annotations = {};

        for (var y = links.length - 1; y >= 0; y--) {
          var link = angular.copy(scope.links[y]),
              s = link.source,
              t = link.target;

            if(self.configuration.mergeLinks === true) {

              var recorded = [s, t, (link.type || link.id)].join("-");
              if(typeof existing[recorded] === "undefined") {
                existing[recorded] = link.id;
              } else {
                if(typeof scope.annotations[existing[recorded]].alternativeIds === "undefined") {
                  scope.annotations[existing[recorded]].alternativeIds = [];
                }
                scope.annotations[existing[recorded]].alternativeIds.push(link.id);
                continue;
              }
            }
          scope.annotations[link.id] = link;
          if(typeof n[s] === "undefined") {
            if(typeof scope.nodes[s] === "undefined") {
              throw "";
            }
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
        }

        return graph;
      };

      /**
       * Remove everything from the svg root
       */
      var cleanSVG = function() {
        if (self.g) self.g.selectAll('*').remove();
      };

      /**
       * Move the graph in a direction
       * @param  {Int} x  Horizontal movement in pixels
       * @param  {Int} y  Vertical movement in pixels
       * @return {undefined}
       */
      var graphMove = function(x ,y) {
        if(typeof x !== "undefined") {
          scope.D3Params.translate.x = scope.D3Params.translate.x + parseInt(x);
          scope.D3Params.translate.y = scope.D3Params.translate.y + parseInt(y);
        } else {
          scope.D3Params.translate.x = 0;
          scope.D3Params.translate.y = 0;
        }
        scale();
      };
      scope.graphMove = graphMove;

      /**
       * Zoom the graph
       * @param  {Float} coeff Coefficient for zoom
       * @return {undefined}
       */
      var graphZoom = function(coeff) {
        if(typeof coeff === "undefined") {
          scope.D3Params.scale = 1;
        } else {
          scope.D3Params.scale = scope.D3Params.scale * parseFloat(coeff);
        }
        scale();
      };
      scope.graphZoom = graphZoom;

      var draggingGraph = function(data, event) {
        return;
      };


      /**
       * Move the graph to a node
       * @param  {?Element} node  Node which should be in the center of the graph
       * @return {undefined}
       */
      var focusNode = function(node) {
        if(node) {
          var point = parseTransformTranslate(node);
          var graph = calculateSvgHotspots();
          var translate = {
            x : graph.realCenter.x - point.x,
            y : graph.realCenter.y - point.y
          };
          graphMove(translate.x, translate.y);
        }
      };

      /**
       * Calculate informations about the graph
       * @return {Object}  Dictionary with informations
       */
      var calculateSvgHotspots = function() {
        var w = tree.width(),
            h = tree.height();
        return {
          width   : w,
          height  : h,
          center : {
            x : w  / 2,
            y: h / 2
          },
          realCenter : {
            x : w / 2 - scope.D3Params.translate.x,
            y: h / 2 - scope.D3Params.translate.y
          }
        };
      };

      /**
       * Parse a the x and y movement of an element's translate attribute
       * @param  {HTMLElement} node Element which we need to parse
       * @return {Object}           Object with x and y corresponding to the translate string
       */
      var parseTransformTranslate = function(node) {
        var translate = node.attr('transform');
        var match = /translate\((.*),(.*?)\)/.exec(translate);
        return {x : match[1], y : match[2]};
      };

      /**
       * Set the center of the graph on the selected token
       * @return {undefined}
       */
      scope.focusSelection = function() {
        var node = state.firstSelected();
        if(node) {
          focusNode(angular.element(getNodeById(node)[0][0]));
        }
      };

      /**
       * Scale and move the graph
       * @return {undefined}
       */
      var scale = function() {
        if(d3.event && d3.event.scale !== null) {
          scope.D3Params.scale = d3.event.scale;
        }
        var graphContainer = self.g.select("g.graphContainer");
        graphContainer.attr("transform", 
          "translate(" + scope.D3Params.translate.x + ", " + scope.D3Params.translate.y + ")" +
          "scale(" + scope.D3Params.scale + ")"
        );
      };

      /**
       * Toggle the visibility of labels for links 
       * @return {Boolean} Indicator of visibility;
       */
      var toggleLabels = function() {
        scope.D3Params.displayLabels = (!scope.D3Params.displayLabels);
        if(scope.D3Params.displayLabels) {
          self.edgeLabels.label.attr("opacity", "1");
          self.edgeLabels.links.attr("opacity", "0");
        } else {
          self.edgeLabels.label.attr("opacity", "0");
          self.edgeLabels.links.attr("opacity", "1");
        }
        return scope.D3Params.displayLabels;
      };
      scope.toggleLabels = toggleLabels;


      /**
       * Add nodes and edges to the graph
       * @param  {Object} graph Object representing the nodes and edges
       */
      var render = function(graph) {
        sortLinks(graph);
        var g,
            svg,
            force;
        self.svg = d3.select(element[0]);

        svg = self.g = self.svg.select('g');

        var graphContainer = svg
          .append("g")
          .attr("class", "graphContainer");

        graphContainer
          .call(d3.behavior.zoom().on("zoom", scale));

        var nodeContainers = graphContainer
          .append("g")
          .attr("class", "nodes");

        var linkContainers = graphContainer
          .append("g")
          .attr("class", "links");

        var edgeLabelsContainers = graphContainer
          .append("g")
          .attr("class", "edge-labels");


        force = self.force = d3.layout.force()
            .charge(linkCharge)
            .linkDistance(linkDistance)
            .size([tree.width(), tree.height()]);

        force
          .nodes(graph.nodes)
          .links(graph.links)
          .start();

        scope.D3Params.running = true;

        var link = linkContainers.selectAll(".link")
            .data(graph.links)
          .enter().append("path")
            .attr("class", "link")
            .attr("id", function(d) { return "geph-path-" + d.id; })
            .style("stroke-width", function(d) { 
              if(typeof self.configuration.weight !== "undefined") {
                if(typeof self.configuration.maxWeight === "undefined") {
                  computeMaxWeight();
                }
                var t = d.type;
                if(typeof self.configuration.weight[t] !== "undefined") {
                  return self.configuration.maxWeight * 1 / self.configuration.weight[t];
                }
              }
              return Math.sqrt(d.value);
            });
        if(typeof self.configuration.colors !== "undefined") {
          link.style("stroke", function(d) {
              var t = d.type;
              if(typeof self.configuration.colors[t] !== "undefined") {
                return self.configuration.colors[t];
              } else {
                return self.configuration.defaultColor;
              }
            });
        }


        var node = nodeContainers.selectAll(".node")
            .data(graph.nodes)
          .enter().append("g")
            .attr("class", "node")
            .attr("overflow", "visible")
            .attr("data-node-id", function(d) { return d.id; })
            .call(force.drag);

        var nodesLabel  = insertNodes(node);
        var insertedEdges = insertEdges(edgeLabelsContainers, graph);
        self.edgeLabels = {
          container : insertedEdges[0],
          label : insertedEdges[1],
          links : insertedEdges[2]
        };
        if(!self.configuration.viewer) {
          self.edgeLabels.label.attr("opacity", "0");
        }
        var mLinkNum = setLinkIndexAndNum(graph);

        force.on("tick", function() {
          var ticks = {};
          link.attr("d", function(d) {
            var dr = computeDR(d, ticks, mLinkNum);
            // generate svg path
            return "M" + d.source.x + "," + d.source.y + 
                "A" + dr + "," + dr + " 0 0 1," + d.target.x + "," + d.target.y + 
                "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y;  
          });

          if(!self.configuration.viewer) {
            self.edgeLabels.links.attr("transform", function(d) {
              var dr = computeDR(d, ticks, mLinkNum);
              //(p0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p1, t)
              // @t represents where, from 0 to 1, the point your are looking for is. 0.5 would be the center of the curve. 
              var point = SVGCurveLib.pointOnEllipticalArc(
                {x : d.source.x, y : d.source.y},
                dr,
                dr,
                0,
                0,
                1,
                {x : d.target.x, y:d.target.y},
                0.5
              );
              return translateMiddle(point, this);
            });
          }
          

          node.attr("transform", function(d) { 
            return translateMiddle(d, this);
          });
        });
      };

      /**
       * Compute the DR of a link path
       * @param  {Object} d        D3 JS Force Graph's object
       * @param  {Object} cache    Caching object
       * @param  {Object} mLinkNum Dictionary which contains informations about the number of links between two nodes
       * @return {Float}           DR of the link path
       */
      var computeDR = function(d, cache, mLinkNum) {
        if(cache[d.id]) {
          return cache[d.id];
        }
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        // get the total link numbers between source and target node
        var lTotalLinkNum = mLinkNum[d.source.id + "," + d.target.id] || mLinkNum[d.target.id + "," + d.source.id];
        if(lTotalLinkNum > 1) {
            // if there are multiple links between these two nodes, we need generate different dr for each path
            dr = dr/(1 + (1/lTotalLinkNum) * (d.linkindex - 1));
        }
        cache[d.id] = dr;
        return dr;
      };


      /**
       * Sort the graph data
       * @param  {[type]} data [description]
       * @return {[type]}      [description]
       */
      var sortLinks = function (data) {
        data.links.sort(function(a,b) {
          if (a.source > b.source) {
              return 1;
          } else if (a.source < b.source) {
              return -1;
          } else {
            if (a.target > b.target) {
                return 1;
            } else if (a.target < b.target) {
                return -1;
            } else {
                return 0;
            }
          }
        });
      };

      /**
       * Create link index
       * @param {Object} data Graph
       */
      var setLinkIndexAndNum = function(data) {
        var mLinkNum = {};
        for (var i = 0; i < data.links.length; i++) {
          if (i !== 0 && data.links[i].source == data.links[i-1].source && data.links[i].target == data.links[i-1].target) {
              data.links[i].linkindex = data.links[i-1].linkindex + 1;
          } else {
              data.links[i].linkindex = 1;
          }
          // save the total number of links between two nodes
          if(mLinkNum[data.links[i].target.id + "," + data.links[i].source.id] !== undefined) {
              mLinkNum[data.links[i].target.id + "," + data.links[i].source.id] = data.links[i].linkindex;
          } else {
              mLinkNum[data.links[i].source.id + "," + data.links[i].target.id] = data.links[i].linkindex;
          }
        }
        return mLinkNum;
      };

      /**
       * [initiateGraph description]
       * @return {[type]} [description]
       */
      var initiateGraph = function() {
        //We reset our stuff
        scope.nodes = {};
        scope.links = [];
        scope.annotations = {};

        scope.graph = {
          nodes : [],
          links : []
        };
        angular.forEach(scope.tokens, function(token, tokenId) {
          if(!nodeExists(token)) createToken(token.id);

          for (var i = token.graph.length - 1; i >= 0; i--) {
            createLink(token.id, token.graph[i]);
          }
        });
      };


      /**
       * [templatePath description]
       * @param  {[type]} name [description]
       * @return {[type]}      [description]
       */
      var templatePath = function(name) {
        return "templates/arethusa.opendata_network/" + name + ".html";
      };

      /**
       * [prependTemplate description]
       * @param  {[type]} template [description]
       * @return {[type]}          [description]
       */
      var prependTemplate = function(template) {
        var el = '<span class="right" ng-include="' + template + '"/>';
        angular.element(element[0].previousElementSibling).append($compile(el)(scope));
      };
      scope.panelTemplate = templatePath('opendata_settings');

      /**
       * Draw a D3JS Graph like structure
       */
      var draw = function() {
        if(!self.svg) {
          element.append(tree);
          prependTemplate('panelTemplate');
        }
        var graph = upgradeGraph();
        if(graph.nodes.length >= 2) {
          cleanSVG();
          render(graph);
        }
      };

      self.childScopes = [];

      var grid = function () { return element.parents('.gridster'); };
      var isPartOfGrid = function() { return grid().length; };
      var gridReady = function() { return grid().hasClass('gridster-loaded'); };

      /**
       * [launch description]
       * @return {[type]} [description]
       */
      this.launch = function() {
        initiateGraph();
        if (isPartOfGrid() && !gridReady()) {
          $timeout(draw, 130);
        } else {
          draw();
        }
      };

      /**
       * Augment the charge coefficient of the force graph drawer
       * @param  {[type]} coefficient [description]
       * @return {[type]}             [description]
       */
      var forceCharge = function(coefficient) {
        var coeff = parseInt(coefficient);
        scope.D3Params.charge = scope.D3Params.charge + coefficient;
      };

      /**
       * [linkDistanceChanger description]
       * @param  {[type]} coefficient [description]
       * @return {[type]}             [description]
       */
      var linkDistanceChanger = function(coefficient) {
        var coeff = parseInt(coefficient);
        scope.D3Params.linkDistance = scope.D3Params.linkDistance + coefficient;
      };

      /**
       * [forceToggle description]
       * @return {[type]} [description]
       */
      var forceToggle = function() {
        scope.D3Params.running = !scope.D3Params.running;
        if(scope.D3Params.running === true) {
          self.force.resume();
        } else {
          self.force.stop();
        }
      };
      scope.forceToggle = forceToggle;

      scope.$watch("D3Params.linkDistance", function(newVal, oldVal, event) {
        if(newVal !== oldVal) {
          self.force.stop().linkDistance(linkDistance).start();
        }
      });

      scope.$watch("D3Params.charge", function(newVal, oldVal, event) {
        if(newVal !== oldVal) {
          self.force.stop().charge(linkCharge).start();
        }
      });

      /**
       * [keyBindings description]
       * @param  {[type]} kC [description]
       * @return {[type]}    [description]
       */
      var keyBindings = function(kC) {
        return {
          tree: [
            kC.create('graphLeft', function() { graphMove(-20, 0); }, 'q'),
            kC.create('graphCenter', function() { graphMove(); }, 's'),
            kC.create('graphRight', function() { graphMove(20, 0); }, 'd'),
            kC.create('graphTop', function() { graphMove(0, 20); }, 'z'),
            kC.create('graphBottom', function() { graphMove(0, -20); }, 'x'),
            kC.create('forceChargePlus', function() { forceCharge(+10); }, 'f'),
            kC.create('forceChargeMinus', function() { forceCharge(-10); }, 'c'),
            kC.create('linkDistancePlus', function() { linkDistanceChanger(+10); }, 'g'),
            kC.create('linkDistanceMinus', function() { linkDistanceChanger(-10); }, 'v'),
            kC.create('forceToggle', function() { forceToggle(); }, 'p'),
            kC.create('focusNode', function() { scope.focusSelection(); }, 'a'),
          ]
        };
      };

      var keys = keyCapture.initCaptures(keyBindings);

      scope.keyHints = arethusaUtil.inject({}, keys.tree, function(memo, name, key) {
        memo[name] = arethusaUtil.formatKeyHint(key);
      });

      scope.$on('$destroy', keys.$destroy);

    };
  }
]);
