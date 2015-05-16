"use strict";

angular.module('arethusa.opendataNetwork').factory('graph', [
  '$compile',
  'state',
  '$timeout',
  'keyCapture',
  function ($compile, state, $timeout, keyCapture) {
    return function(scope, element, conf) {

      var self = this,
          defaultEdgeLabel = "+";

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

      var tokenHtml = '\
          <span token="token"\
            style="white-space: nowrap;"\
            click="true"\
            hover="true"\
            />\
        ';
      var edgeHtml = '\
          <span open-data-edge="edge"\
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
       */
      var getTokenPlaceholders = function() {
        ;return self.svg.selectAll("div.node.token-node")
      }
      /**
       * Get Edge placeholders
       */
      var getEdgePlaceholders = function() {
        return self.svg.selectAll("div.edge.edge-node")
      };

      /**
       * Return the translate string for the middle of one rectangle
       * @param  {Object} point   Representation of a point
       * @param  {[type]} element [description]
       * @return {[type]}         [description]
       */
      var translateMiddle = function(point, element) {
        try {
          var w = element.children[0].width.baseVal.value,
              h = element.children[0].height.baseVal.value;
        } catch(e) {
          var w = 0,
              h = 0;
        }
        return "translate(" + (point.x - w/2)  + "," + (point.y - h/2) + ")";
      };

      /**
       * Update the width of foreignObjects
       * @param {string} class Class to be retrieved
       */
      var updateWidth = function(class) {
          var foreigns = getForeignObject();
          foreigns.each(function(element, data, index) {
            var tph = this.getElementsByClassName(class);
            if(tph.length === 1) { // We have selected all foreigns objects, we need to filter that.
              tph = tph[0];
              this.setAttribute("width", tph.offsetWidth);
              this.setAttribute("height", tph.offsetHeight);
            }
          });
        }

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
        return (typeof scope.nodes[id] !== "undefined")
      };

      /*
        Watching tokens graph properties
       */
      state.watch("graph", function(newVal, oldVal, event) {
        var token = event.token;
        initiateGraph();
        /*
        //The following part remove somehow the links where event.token is the target...
        // There is an issue with how we upgrade the graph in the end !
        cleanLinks(token.id);

        if(!nodeExists(token)) createToken(token.id);

        for (var i = newVal.length - 1; i >= 0; i--) {
          createLink(token.id, newVal[i]);
        };
        */

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
        };
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
       * @return
       */
      var createToken = function(tokenId) {
        var token = state.getToken(tokenId)
        scope.nodes[token.id] = {
          name: token.string,
          token: token,
          id: token.id
        }
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
       * @param  {D3JSObject} root  Root of the graph
       * @param  {Object}     graph Graph object
       */
      var insertEdges = function(root, graph) {
        var g = root.selectAll(".edgesLabels")
            .data(graph.links).enter()
            .append("g")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle");

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
              return '<div class="edge edge-node placeholder" id="geph' + d.id + '" style="display:inline;">' + defaultEdgeLabel + '</div>';
          });

        updateWidth("edge-node");

        var tokenDirectives = getEdgePlaceholders()
          .append(function() {
            // As we compiled html, we don't have any data inside this node.
            this.textContent = '';
            return compiledEdge(scope.annotations[this.id.slice(4)].token);
          });
        return g;
      };

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
            scope.annotations = {};
        for (var y = links.length - 1; y >= 0; y--) {
          var link = angular.copy(scope.links[y]),
              s = link.source,
              t = link.target;

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
        };

        return graph;
      };

      /**
       * Remove everything from the svg root
       */
      var cleanSVG = function() {
        if (self.g) self.g.selectAll('*').remove();
      };

      /**
       * Insert navigators helper
       * @param  {SVG} root [description]
       * @return {[type]}      [description]
       */
      var insertNavigators = function(root) {
        var nav = root
          .append("g")
          .attr("class", "navigator");

        var w = 60,
            h = 60;

        var up = nav
          .append("g")
          .attr("class", "navigator-up");
        up
          .append("path")
          .style("fill", "grey")
          .attr("d", "M " + w/2 + " 0, L " + w/3 + " " + h/3 + ", L " + w/3*2 + " " + h/3);
        up.on("click", function() {
          graphMove(0, 20);
        });

        var down = nav
          .append("g")
          .attr("class", "navigator-down");
        down
          .append("path")
          .style("fill", "grey")
          .attr("d", "M " + w/2 + " "+ h + ", L " + w/3 + " " + h/3*2 + ", L " + w/3*2 + " " + h/3*2);
        down.on("click", function() {
          graphMove(0, -20);
        });


        var left = nav
          .append("g")
          .attr("class", "navigator-left");
        left
          .append("path")
          .style("fill", "grey")
          .attr("d", "M " + 0 + " "+ h/2 +", L " + w/3 + " " + h/3 + ", L " + w/3 + " " + h/3*2);
        left.on("click", function() {
          graphMove(-20, 0);
        });


        var right = nav
          .append("g")
          .attr("class", "navigator-right");
        right
          .append("path")
          .style("fill", "grey")
          .attr("d", "M " + w/3*2 + " "+ h/3 +", L " + w + " " + h/2 + ", L " + w/3*2 + " " + h/3*2);
        right.on("click", function() {
          graphMove(+20, 0);
        });

        var centerContainer = nav
          .append("g")
          .attr("class", "navigator-center");
        var center = centerContainer
          .append("foreignObject")
          .attr("width", w/3)
          .attr("height", h/3)
          .attr("transform", "translate("+ w/3+", "+h/3+")")
          .append("xhtml:div")
          .html(function(d) {
            // Ids : Graph Token PlaceHolder
              return '<div style="line-height: '+w/3+'px; text-align:center;"><i class="fa fa-crosshairs"></i></div>';
          });
        center.on("click", function() {
          graphMove();
        });
      };

      var graphMove = function(w, h) {
        var graphContainer = self.g.select("g.graphContainer");

        if(typeof w !== "undefined") {
          var xy = (graphContainer.attr("transform") || "0, 0").match(translateRegexp);
          graphContainer.attr("transform", "translate(" + (parseInt(xy[1]) + w) + ", " + (parseInt(xy[2]) + h) + ")");
        } else {
           graphContainer.attr("transform", "translate(0, 0)");
        }
      };



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
        insertNavigators(self.g);

        var graphContainer = svg
          .append("g")
          .attr("class", "graphContainer");

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
            .charge(-200)
            .linkDistance(100)
            .size([tree.width(), tree.height()]);

        force
          .nodes(graph.nodes)
          .links(graph.links)
          .start();

        var mLinkNum = setLinkIndexAndNum(graph);
        var link = linkContainers.selectAll(".link")
            .data(graph.links)
          .enter().append("path")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = nodeContainers.selectAll(".node")
            .data(graph.nodes)
          .enter().append("g")
            .attr("class", "node")
            .attr("overflow", "visible")
            .call(force.drag);

        insertNodes(node);
        var edgesLabels = insertEdges(edgeLabelsContainers, graph);

        force.on("tick", function() {
          link.attr("d", function(d) {
              var dx = d.target.x - d.source.x,
                  dy = d.target.y - d.source.y,
                  dr = Math.sqrt(dx * dx + dy * dy);
              // get the total link numbers between source and target node
              var lTotalLinkNum = mLinkNum[d.source.id + "," + d.target.id] || mLinkNum[d.target.id + "," + d.source.id];
              if(lTotalLinkNum > 1) {
                  // if there are multiple links between these two nodes, we need generate different dr for each path
                  dr = dr/(1 + (1/lTotalLinkNum) * (d.linkindex - 1));
              }

              // generate svg path
              return "M" + d.source.x + "," + d.source.y + 
                  "A" + dr + "," + dr + " 0 0 1," + d.target.x + "," + d.target.y + 
                  "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y;  
          });

          edgesLabels.attr("transform", function(d) {
              var dx = d.target.x - d.source.x,
                  dy = d.target.y - d.source.y,
                  dr = Math.sqrt(dx * dx + dy * dy);
              // get the total link numbers between source and target node
              var lTotalLinkNum = mLinkNum[d.source.id + "," + d.target.id] || mLinkNum[d.target.id + "," + d.source.id];
              if(lTotalLinkNum > 1) {
                  // if there are multiple links between these two nodes, we need generate different dr for each path
                  dr = dr/(1 + (1/lTotalLinkNum) * (d.linkindex - 1));
              }

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

          node.attr("transform", function(d) { 
            return translateMiddle(d, this);
          });
        });
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
      }

      /**
       * Create link index
       * @param {Object} data Graph
       */
      var setLinkIndexAndNum = function(data) {
        var mLinkNum = {};
        for (var i = 0; i < data.links.length; i++) {
          if (i != 0 && data.links[i].source == data.links[i-1].source && data.links[i].target == data.links[i-1].target) {
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
      }

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
          //if(token.graph.length > 0) {
            if(!nodeExists(token)) createToken(token.id);

            for (var i = token.graph.length - 1; i >= 0; i--) {
              createLink(token.id, token.graph[i]);
            };
          //}
        });
      };

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
          //updateWidth();
        }
      }

      self.childScopes = [];

      function grid() { return element.parents('.gridster'); }
      function isPartOfGrid() { return grid().length; }
      function gridReady() { return grid().hasClass('gridster-loaded'); }

      this.launch = function() {
        initiateGraph();
        if (isPartOfGrid() && !gridReady()) {
          $timeout(draw, 130);
        } else {
          draw();
        }
      };

      function keyBindings(kC) {
        return {
          tree: [
            kC.create('graphLeft', function() { graphMove(-20, 0); }, 'q'),
            kC.create('graphCenter', function() { graphMove(); }, 's'),
            kC.create('graphRight', function() { graphMove(20, 0); }, 'd'),
            kC.create('graphTop', function() { graphMove(0, 20); }, 'z'),
            kC.create('graphBottom', function() { graphMove(0, -20); }, 'x'),
          ]
        };
      }

      var keys = keyCapture.initCaptures(keyBindings);

      scope.keyHints = arethusaUtil.inject({}, keys.tree, function(memo, name, key) {
        memo[name] = arethusaUtil.formatKeyHint(key);
      });

      scope.$on('$destroy', keys.$destroy);

    }
  }
]);
