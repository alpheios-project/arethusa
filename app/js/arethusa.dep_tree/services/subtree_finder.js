'use strict';
angular.module('arethusa.depTree').service('subtreeFinder', function () {
  var roots;
  function createRoot(id) {
    var root = {};
    root[id] = true;
    roots[id] = root;
    return root;
  }
  function isRoot(id) {
    return roots.hasOwnProperty(id);
  }
  function takeRoot(id) {
    var n = roots[id];
    delete roots[id];
    return n;
  }
  function addNode(headId, id) {
    if (!isRoot(headId)) {
      createRoot(headId);
    }
    var head = roots[headId];
    var childrenIds = isRoot(id) ? takeRoot(id) : createRoot(id);
    angular.extend(head, childrenIds);
  }
  function removeEmptyRoots() {
    angular.forEach(roots, function (obj, id) {
      if (Object.keys(obj).length === 1) {
        delete roots[id];
      }
    });
  }
  function collectTopDown() {
    return arethusaUtil.inject({}, roots, function (memo, id, children) {
      memo[id] = collectChildren(id, children);
    });
  }
  function collectChildren(id, children) {
    var res = {};
    angular.extend(res, children);
    angular.forEach(children, function (val, childId) {
      if (id !== childId) {
        if (isRoot(childId)) {
          var addChildren = takeRoot(childId);
          var recurse = collectChildren(childId, addChildren);
          angular.extend(res, recurse);
        }
      }
    });
    return res;
  }
  this.find = function (tokens) {
    roots = {};
    createRoot('0000');
    angular.forEach(tokens, function (token, id) {
      if ((token.head || {}).id) {
        addNode(token.head.id, token.id);
      } else {
        createRoot(token.id);
      }
    });
    removeEmptyRoots();
    return collectTopDown();
  };
});
