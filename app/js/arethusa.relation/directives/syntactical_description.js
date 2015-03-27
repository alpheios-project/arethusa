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
        '<span class="syntax-token">',
          '{{ content.' + arg + '.string}}',
        '</span>'
      ].join('');
    }

    function getTpl(counts) {
      var id = [counts.leftHand, counts.rightHand].join('-');
      return TEMPLATES[id];
    }

    return {
      restrict: 'EA',
      scope: {
        tokenId: '='
      },
      link: function(scope, element, attrs) {
        var counts, token, head, tracker = [], watchers = [];

        scope.$watch('tokenId', init);

        addWatcher('head.id');
        addWatcher('relation.label');

        scope.$on('$destroy', removeWatchers);

        function init(id) {
          resetCounts();
          resetContent();

          token = getToken(id);
          var headId = token ? aU.getProperty(token, HEAD_PROPERTY) : undefined;
          head = getToken(headId);

          if (token) addLeft();
          if (head) addRight();

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

        function addLeft() {
          counts.leftHand += 1;
        }

        function addRight() {
          counts.rightHand += 1;
        }

        function resetCounts() {
          counts = { leftHand: 0, rightHand: 0 };
        }

        function resetContent() {
          scope.content= {};
        }

        function setContent(name, obj) {
          scope.content[name] = obj;
        }

        function getContent(name) {
          return scope.content[name];
        }

        function recompile() {
          element.empty();

          var template = getTpl(counts);
          if (template) {
            setContent('target', toScopeObj(token));
            setContent('head', toScopeObj(head));

            var content = $compile(template)(scope);
            element.append(content);
          }

        }

        function getArticle(label) {
          label = label || '';
          return label.match(/^[aeiou]/) ? 'an' : 'a';
        }

        function toScopeObj(token) {
          var string, label, style;
          if (isRoot(token)) {
            string = 'root of the sentence';
          } else {
            var relObj = relation.getLabelObj(token);
            label = relObj.long;
            style = relObj.style;
            string = token.string;
          }
          return {
            string: string,
            label: label,
            style: style,
            article: getArticle(label)
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
