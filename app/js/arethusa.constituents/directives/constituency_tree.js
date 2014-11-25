"use strict";

angular.module('arethusa.constituents').directive('constituencyTree', [
  'Tree',
  'globalStore',
  'commons',
  '$compile',
  function (Tree, globalStore, commons, $compile) {
    function noop() {}
    // This prefix is itself prefixed with zeroes - that way we can guarantee
    // a certain sorting order, so that tokens always show up left of their
    // constituents.
    var idPrefix = '000-constituent-';

    return {
      restrict: 'A',
      scope: {
        tokens: '=',
        styles: '='
      },
      link: function (scope, element, attrs) {
        var constituents = {};

        function prefixedId(id) {
          var regexp = new RegExp('^' + idPrefix);
          return regexp.exec(id) ? id : idPrefix + id;
        }

        function addConstituent(constituent) {
          var constId = constituent.id;
          var id = prefixedId(constId);
          constituents[id] = constituent;
        }

        var mainAttribute = 'constituency.parent';

        var tree = new Tree(scope, element, {
          mainAttribute: mainAttribute,
          parentPlugin: 'constituents',
          direction: 'vertical'
        });

        function constituentPlaceholder(constituent) {
          var label = 'xxxx - xxxx';
          return '<div class="node constituent-node" id="cph' + constituent.id + '">' + label + '</div>';
        }


        function createNode(obj) {
          if (obj.isToken) {
            tree.createNode(obj);
          } else {
            tree.g.addNode(obj.id, { label: constituentPlaceholder(obj) });
          }
        }

        function addEdge(id, headId) {
          tree.g.addEdge(id, id, headId);
        }

        function drawEdge(obj) {
          var id = obj.id;

          // This is a hack - we have some troubles here on
          // tokenRemoved events which I don't really understand -
          // can't think of a scenario where a token without an id
          // comes in here. It's actually a token that has just a
          // single property (head) - really have no clue.
          //
          // This prevents it, but the root cause for this needs to
          // be investigated.
          if (!angular.isDefined(id)) return;

          if (!tree.nodePresent(id)) {
            createNode(obj);
            if (obj.isConstituent) addConstituent(obj);
          }

          if (obj.isToken) {
            var fakeConstId = idPrefix + id;
            if (!tree.nodePresent(fakeConstId)) {
              var fakeConstituent = commons.constituent(
                null,
                obj.constituency.role,
                fakeConstId,
                obj.sentenceId,
                obj.constituency.parent
              );
              drawEdge(fakeConstituent);
              addEdge(id, fakeConstId);
            }
          } else {
            var headId = obj.parent;
            if (!headId) return; // Sentence Root!

            if (!tree.nodePresent(headId)) {
              var constituent = globalStore.constituents[headId];
              addConstituent(constituent);
              drawEdge(constituent);
            }

            addEdge(id, headId);
          }
        }

        function insertNodeDirectives() {
          tree.insertTokenDirectives();
          insertConstituentDirectives();
        }

        function insertConstituentDirectives() {
          constituentNodes().append(function () {
            // This is the element we append to and we created as a placeholder
            // We clear out its text content so that we can display the content
            // of our compiled token directive.
            // The placholder has an id in the format of tphXXXX where XXXX is the id.

            this.textContent = '';
            var id = this.id.slice(3);
            return compiledConstituent(constituents[prefixedId(id)]);
          });
        }

        function constituentNodes() {
          return tree.vis.selectAll('div.node.constituent-node');
        }

        function compiledConstituent(constituent) {
          var childScope = scope.$new();
          tree.childScopes.push(childScope);
          childScope.constituent = constituent;

          return $compile(constituentHtml)(childScope)[0];
        }

        var constituentHtml = '<span constituent="constituent"/>';

        function compactTree() {
          scope.nodeSep = 20;
          scope.edgeSep = 7;
          scope.rankSep = 10;
        }

        function wideTree() {
          scope.nodeSep = 30;
          scope.edgeSep = 10;
          scope.rankSep = 30;
        }

        tree.drawEdge = drawEdge;
        tree.insertEdgeDirectives = noop;
        tree.insertNodeDirectives = insertNodeDirectives;

        tree.compactTree = compactTree;
        tree.wideTree    = wideTree;

        tree.launch();
      },
    };
  }
]);
