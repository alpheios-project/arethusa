"use strict";

angular.module('arethusa.relation').directive('syntacticalDescription', [
  '$compile',
  'state',
  'relation',
  '_',
  function(
    $compile,
    state,
    relation,
    _
  ) {
    var HEAD_PROPERTY = 'head.id';

    var TEMPLATES = {
      // When a token has no head
      '1-0': [
        '<div>',
          tokenTpl('target'),
          'is {{ content.target.article}}',
          labelTpl('target') + '.',
        '</div>'
      ].join(' '),

      // When a token has a head
      '1-1': [
        '<div>',
          tokenTpl('target'),
          'is {{ content.target.article}}',
          labelTpl('target'),
          'of the',
          labelTpl('head'),
          tokenTpl('head') + '.',
        '</div>'
      ].join(' ')

      // When a coordinated token has no head

      // When a coordinated token has a head

      // When a coordinated token has a coordinated head

      // When a token is in apposition

      // ...
    };

    function labelTpl(arg) {
      return [
        '<span ng-style="{{ content.' + arg + '.style }}">',
          '{{ content.' + arg + '.label}}',
        '</span>'
      ].join('');
    }

    function tokenTpl(arg) {
      return [
        '<span ng-if=" content.' + arg + '.token"',
          'token="content.' + arg + '.token"',
          'class="syntax-token"',
          'click="true"',
          'hover="true">',
        '</span>',
        '<span ng-if="!content.' + arg + ' .token"',
          'class="syntax-token">',
          '{{ content.' + arg + '.string}}',
        '</span>'
      ].join(' ');
    }

    function getTpl(counts) {
      var id = [counts.left, counts.right].join('-');
      return TEMPLATES[id];
    }

    return {
      restrict: 'EA',
      scope: {
        tokenId: '='
      },
      link: function(scope, element, attrs) {
        var counts, token, head, tracker = [], watchers = [];
        var left, right;

        scope.$watch('tokenId', init);

        addWatcher('head.id');
        addWatcher('relation.label');

        scope.$on('$destroy', removeWatchers);

        function init(id) {
          reset();

          left.token  = getToken(id);
          right.head  = getHead(left.token);

          calculateCounts();
          recompile();
        }

        function update(newVal, oldVal, event) {
          if (isTracked(event.token.id)) {
            init(scope.tokenId);
          }
        }

        function addWatcher(property) {
          watchers.push(state.watch(property, update));
        }

        function removeWatchers() {
          while (watchers.length) {
            watchers.pop()(); // deregister
          }
        }

        function isTracked(id) {
          return _.contains(tracker, id);
        }

        function getToken(id) {
          if (id) {
            addToTracker(id);
            return state.getToken(id);
          } else {
            removeFromTracker(id);
          }
        }

        function getHead(token) {
          var id;
          if (token) id = aU.getProperty(token, HEAD_PROPERTY);
          return id ? state.getToken(id) : undefined;
        }

        function addToTracker(id) {
          if (!isTracked(id)) {
            tracker.push(id);
          }
        }

        function removeFromTracker(id) {
          var i = tracker.indexOf(id);
          if (i) {
            tracker.splice(i, 1);
          }
        }

        function calculateCounts() {
          if (left.token) addLeft();
          if (right.head) addRight();
        }

        function addLeft() {
          counts.left += 1;
        }

        function addRight() {
          counts.right += 1;
        }

        function reset() {
          resetContainers();
          resetCounts();
          resetContent();
        }

        function resetCounts() {
          counts = { left: 0, right: 0 };
        }

        function resetContainers() {
          left  = {};
          right = {};
        }

        function resetContent() {
          scope.content= {};
        }

        function setContent(name, obj) {
          if (!obj) return;
          scope.content[name] = obj;
        }

        function getContent(name) {
          return scope.content[name];
        }

        function recompile() {
          element.empty();

          var template = getTpl(counts);

          if (template) {
            setContent('target', toScopeObj(left.token));
            setContent('head', toScopeObj(right.head));

            var content = $compile(template)(scope);
            element.append(content);
          }

        }

        function getArticle(label) {
          label = label || '';
          return label.match(/^[aeiou]/) ? 'an' : 'a';
        }

        function toScopeObj(token) {
          if (!token) return;

          var string, label, style;
          if (isRoot(token)) {
            string = 'root of the sentence';
            token = undefined;
          } else {
            var relObj = relation.getLabelObj(token);
            label = relObj.long;
            style = relObj.style;
            string = token.string;
          }
          return {
            token: token,
            string: string,
            label: label,
            style: style,
            article: getArticle(label),
          };
        }

        function isRoot(token) {
          // no good way to detect this right now - as state.getToken is returning
          // an empty object when a token cannot be found in the store, this will
          // in all cases right now be the root. Very brittle!
          return angular.equals(token, {});
        }
      }
    };
  }
]);
