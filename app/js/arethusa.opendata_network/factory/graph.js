"use strict";

angular.module('arethusa.opendataNetwork').factory('graph', [
  '$compile',
  'state',
  '$timeout',
  function ($compile, state, $timeout) {
    return function(scope, element, conf) {

      var self = this;

      var toRadians = function(angle) {
        return angle * (Math.PI / 180);
      };
      var mod = function(x, m) {
          return (x%m + m)%m;
      };

      var angleBetween = function(v0, v1) {
        var p = v0.x*v1.x + v0.y*v1.y;
        var n = Math.sqrt((Math.pow(v0.x, 2)+Math.pow(v0.y, 2)) * (Math.pow(v1.x, 2)+Math.pow(v1.y, 2)));
        var sign = v0.x*v1.y - v0.y*v1.x < 0 ? -1 : 1;
        var angle = sign*Math.acos(p/n);
        
        //var angle = Math.atan2(v0.y, v0.x) - Math.atan2(v1.y,  v1.x);
        
        return angle;
      };
      /**
       * [pointOnEllipticalArc description]
       * @url https://github.com/MadLittleMods/svg-curve-lib/blob/master/src/js/svg-curve-lib.js#L84-L187
       * @param  {[type]} p0            [description]
       * @param  {[type]} rx            [description]
       * @param  {[type]} ry            [description]
       * @param  {[type]} xAxisRotation [description]
       * @param  {[type]} largeArcFlag  [description]
       * @param  {[type]} sweepFlag     [description]
       * @param  {[type]} p1            [description]
       * @param  {[type]} t             [description]
       * @return {[type]}               [description]
       */
      var pointOnEllipticalArc = function(p0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p1, t) {
        // In accordance to: http://www.w3.org/TR/SVG/implnote.html#ArcOutOfRangeParameters
        rx = Math.abs(rx);
        ry = Math.abs(ry);
        xAxisRotation = mod(xAxisRotation, 360);
        var xAxisRotationRadians = toRadians(xAxisRotation);
        // If the endpoints are identical, then this is equivalent to omitting the elliptical arc segment entirely.
        if(p0.x === p1.x && p0.y === p1.y) {
          return p0;
        }
        
        // If rx = 0 or ry = 0 then this arc is treated as a straight line segment joining the endpoints.    
        if(rx === 0 || ry === 0) {
          return this.pointOnLine(p0, p1, t);
        }

        
        // Following "Conversion from endpoint to center parameterization"
        // http://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
        
        // Step #1: Compute transformedPoint
        var dx = (p0.x-p1.x)/2;
        var dy = (p0.y-p1.y)/2;
        var transformedPoint = {
          x: Math.cos(xAxisRotationRadians)*dx + Math.sin(xAxisRotationRadians)*dy,
          y: -Math.sin(xAxisRotationRadians)*dx + Math.cos(xAxisRotationRadians)*dy
        };
        // Ensure radii are large enough
        var radiiCheck = Math.pow(transformedPoint.x, 2)/Math.pow(rx, 2) + Math.pow(transformedPoint.y, 2)/Math.pow(ry, 2);
        if(radiiCheck > 1) {
          rx = Math.sqrt(radiiCheck)*rx;
          ry = Math.sqrt(radiiCheck)*ry;
        }

        // Step #2: Compute transformedCenter
        var cSquareNumerator = Math.pow(rx, 2)*Math.pow(ry, 2) - Math.pow(rx, 2)*Math.pow(transformedPoint.y, 2) - Math.pow(ry, 2)*Math.pow(transformedPoint.x, 2);
        var cSquareRootDenom = Math.pow(rx, 2)*Math.pow(transformedPoint.y, 2) + Math.pow(ry, 2)*Math.pow(transformedPoint.x, 2);
        var cRadicand = cSquareNumerator/cSquareRootDenom;
        // Make sure this never drops below zero because of precision
        cRadicand = cRadicand < 0 ? 0 : cRadicand;
        var cCoef = (largeArcFlag !== sweepFlag ? 1 : -1) * Math.sqrt(cRadicand);
        var transformedCenter = {
          x: cCoef*((rx*transformedPoint.y)/ry),
          y: cCoef*(-(ry*transformedPoint.x)/rx)
        };

        // Step #3: Compute center
        var center = {
          x: Math.cos(xAxisRotationRadians)*transformedCenter.x - Math.sin(xAxisRotationRadians)*transformedCenter.y + ((p0.x+p1.x)/2),
          y: Math.sin(xAxisRotationRadians)*transformedCenter.x + Math.cos(xAxisRotationRadians)*transformedCenter.y + ((p0.y+p1.y)/2)
        };

        
        // Step #4: Compute start/sweep angles
        // Start angle of the elliptical arc prior to the stretch and rotate operations.
        // Difference between the start and end angles
        var startVector = {
          x: (transformedPoint.x-transformedCenter.x)/rx,
          y: (transformedPoint.y-transformedCenter.y)/ry
        };
        var startAngle = angleBetween({
          x: 1,
          y: 0
        }, startVector);
        
        var endVector = {
          x: (-transformedPoint.x-transformedCenter.x)/rx,
          y: (-transformedPoint.y-transformedCenter.y)/ry
        };
        var sweepAngle = angleBetween(startVector, endVector);
        
        if(!sweepFlag && sweepAngle > 0) {
          sweepAngle -= 2*Math.PI;
        }
        else if(sweepFlag && sweepAngle < 0) {
          sweepAngle += 2*Math.PI;
        }
        // We use % instead of `mod(..)` because we want it to be -360deg to 360deg(but actually in radians)
        sweepAngle %= 2*Math.PI;
        
        // From http://www.w3.org/TR/SVG/implnote.html#ArcParameterizationAlternatives
        var angle = startAngle+(sweepAngle*t);
        var ellipseComponentX = rx*Math.cos(angle);
        var ellipseComponentY = ry*Math.sin(angle);
        
        var point = {
          x: Math.cos(xAxisRotationRadians)*ellipseComponentX - Math.sin(xAxisRotationRadians)*ellipseComponentY + center.x,
          y: Math.sin(xAxisRotationRadians)*ellipseComponentX + Math.cos(xAxisRotationRadians)*ellipseComponentY + center.y
        };

        // Attach some extra info to use
        point.ellipticalArcStartAngle = startAngle;
        point.ellipticalArcEndAngle = startAngle+sweepAngle;
        point.ellipticalArcAngle = angle;

        point.ellipticalArcCenter = center;
        point.resultantRx = rx;
        point.resultantRy = ry;

        return point;
      }

      // General margin value so that trees don't touch the canvas border.
      var treeMargin = 15;
      var treeTemplate = '\
        <svg class="full-height full-width">\
          <g transform="translate(' + treeMargin + ',' + treeMargin + ')"/>\
        </svg>\
      ';
      var tree = angular.element(treeTemplate);
      var color = d3.scale.category20();

      //Scope informations
      scope.nodes = {}
      scope.links = []

      scope.graph = {
        nodes : [],
        links : []
      }

      var tokenHtml = '\
          <span token="token"\
            style="white-space: nowrap;"\
            click="true"\
            hover="true"\
            />\
        ';
      var edgeHtml = '\
          <span edge="edge"\
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
      }
      /**
       * Get Token placeholders
       */
      var getTokenPlaceholders = function() {
        return self.svg.selectAll("div.node.token-node")
      }
      /**
       * Get Edge placeholders
       */
      var getEdgePlaceholders = function() {
        return self.svg.selectAll("div.edge.edge-node")
      }

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
          token: token,
          id: token.id
        }
        return;
      }

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
      }

      /**
       * Insert nodes into the graph
       * @param  {D3JSObject} node [description]
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
          .html(function(d) {
            // Ids : Graph Token PlaceHolder
              return '<div class="edge edge-node placeholder" id="geph' + d.id + '" style="display:inline;">' + d.id + '</div>';
          });

        updateWidth("edge-node");

        /**
        var tokenDirectives = getTokenPlaceholders()
          .append(function() {
            // As we compiled html, we don't have any data inside this node.
            this.textContent = '';
            return compiledToken(scope.nodes[this.id.slice(4)].token);
          });
        */
        return g;
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
          var link = angular.copy(scope.links[y]),
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

      /**
       * Remove everything from the svg root
       */
      var cleanSVG = function() {
        if (self.g) self.g.selectAll('*').remove();
      }

      /**
       * Add nodes and edges to the graph
       * @param  {Object} graph Object representing the nodes and edges
       */
      var render = function(graph) {
        sortLinks(graph);
        var g,
            svg;
        self.svg = d3.select(element[0]);
        svg = self.g = self.svg.select('g');

        var force = d3.layout.force()
            .charge(-200)
            .linkDistance(100)
            .size([tree.width(), tree.height()]);

        force
          .nodes(graph.nodes)
          .links(graph.links)
          .start();

        var mLinkNum = setLinkIndexAndNum(graph);
        var link = svg.selectAll(".link")
            .data(graph.links)
          .enter().append("path")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
            .data(graph.nodes)
          .enter().append("g")
            .attr("class", "node")
            .attr("overflow", "visible")
            .call(force.drag);

        insertNodes(node);
        var edgesLabels = insertEdges(svg, graph);

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
              var point = pointOnEllipticalArc(
                {x : d.source.x, y : d.source.y},
                dr,
                dr,
                0,
                0,
                1,
                {x : d.target.x, y:d.target.y},
                0.5
              )
              console.log(point)
              return "translate(" + point.x + "," + point.y + ")";
          });

          node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        });
      }

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
        if (isPartOfGrid() && !gridReady()) {
          $timeout(draw, 130);
        } else {
          draw();
        }
      };
    }
  }
]);
