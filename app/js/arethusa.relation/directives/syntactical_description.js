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
          '{{ content.target.string }} is {{ content.target.article}}',
          labelTpl('content.target'),
          'of the',
          labelTpl('content.head'),
          '{{ content.head.string }}.',
        '</div>'
      ].join(' ')
    };

    function labelTpl(arg) {
      return '<span ng-style="{{ ' + arg + '.style }}">{{ ' + arg + '.label}}</span>';
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

        function update(token) {
          if (isTracked(token.id)) {
            init();
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
          console.log(label);
          return label.match(/^[aeiou]/) ? 'an' : 'a';
        }

        function toScopeObj(token) {
          var relObj = relation.getLabelObj(token);
          var label = relObj.long;
          var style = relObj.style;
          return {
            string: token.string,
            label: label,
            style: style,
            article: getArticle(label)
          };
        }
      }
    };
  }
]);
