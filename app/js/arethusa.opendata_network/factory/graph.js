"use strict";

angular.module('arethusa.opendataNetwork').factory('graph', [
  '$compile',
  'state',
  '$timeout',
  function ($compile, state, $timeout) {
    return function(scope, element, conf) {

      var self = this;

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
       * Update the width of foreignObjects
       */
      var updateWidth = function() {
          var foreigns = getForeignObject();
          foreigns.each(function(element, data, index) {
            var tph = this.getElementsByClassName("token-node")[0];
            this.setAttribute("width", tph.offsetWidth);
            this.setAttribute("height", tph.offsetHeight);
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
          token: token,
          id: token.id
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
              return '<div class="node token-node" id="gtph' + d.token.id + '" style="display:inline;">' + d.token.string + '</div>';
          });

        updateWidth();

        var tokenDirectives = getTokenPlaceholders()
          .append(function() {
            // As we compiled html, we don't have any data inside this node.
            this.textContent = '';
            console.log(scope.nodes)
            console.log(this.id.slice(4))
            return compiledToken(scope.nodes[this.id.slice(4)].token);
          });

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
