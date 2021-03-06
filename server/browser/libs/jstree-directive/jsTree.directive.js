/*
 * jstree.directive [http://www.jstree.com]
 * https://github.com/arvindr21/jsTree-directive
 *
 * Copyright (c) 2014 Arvind Ravulavaru
 * Licensed under the MIT license.
 */

var ngJSTree = angular.module('jsTree.directive', []);
ngJSTree.directive('jsTree', function($http) {

  var treeDir = {
    restrict: 'EA',
    fetchResource: function(url, cb) {
      return $http.get(url).then(function(data) {
        if (cb) cb(data.data);
      });
    },

    managePlugins: function(s, e, a, config) {
      if (a.treePlugins) {
        config.plugins = a.treePlugins.split(',');
        config.core = config.core || {};
        config.core.check_callback = true;

        if (config.plugins.indexOf('state') >= 0) {
          config.state = config.state || {};
          config.state.key = a.treeStateKey;
        }

        if (config.plugins.indexOf('search') >= 0) {
          var to = false;
          e.before('<input type="text" placeholder="Search Tree" class="ng-tree-search"/>')
            .prev()
            .on('keyup', function(ev) {
              if (to) {
                clearTimeout(to);
              }
              to = setTimeout(function() {
                console.log('xxx');
                treeDir.tree.jstree(true).search(ev.target.value);
              }, 250);
            });
        }

        if (config.plugins.indexOf('checkbox') >= 0) {
          config.checkbox = config.checkbox || {};
          config.checkbox.keep_selected_style = false;
        }

        if (config.plugins.indexOf('contextmenu') >= 0) {
          if (a.treeContextmenu) {
            config.contextmenu = config.contextmenu || {};
            config.contextmenu.items = function() {
              return s[a.treeContextmenu];
            }
          }
        }

        if (config.plugins.indexOf('types') >= 0) {
          if (a.treeTypes) {
            config.types = s[a.treeTypes];
            console.log(config);
          }
        }
      }
      return config;
    },
    manageEvents: function(s, e, a) {
      if (a.treeEvents) {
        var evMap = a.treeEvents.split(';');
        for (var i = 0; i < evMap.length; i++) {
          if (evMap[i].length > 0) {
            var evt = evMap[i].split(':')[0] + '.jstree',
              cb = evMap[i].split(':')[1];
            treeDir.tree.on(evt, s[cb]);
          }
        }
      }
    },
    link: function(s, e, a) { // scope, element, attribute \O/
      $(function() {
        var config = {};
        // clean Case
        a.treeData = a.treeData ? a.treeData.toLowerCase() : '';
        a.treeSrc = a.treeSrc ? a.treeSrc.toLowerCase() : '';

        if (a.treeData == 'html') {
          treeDir.fetchResource(a.treeSrc, function(data) {
            e.html(data);
            treeDir.init(s, e, a, config);
          });
        } else if (a.treeData == 'json') {
          treeDir.fetchResource(a.treeSrc, function(data) {
            config = {
              'core': {
                'data': data
              }
            };
            treeDir.init(s, e, a, config);
          });
        } else if (a.treeAjax) {
          config = {
            'core': {
              'data': {
                'url': a.treeAjax,
                'data': function(node) {
                  return {
                    'id': node.id != '#' ? node.id : 1
                  };
                }
              }
            }
          };
          treeDir.init(s, e, a, config);
        }
      });

    },
    init: function(s, e, a, config) {
      treeDir.managePlugins(s, e, a, config);
      this.tree = $(e).jstree(config);
      treeDir.manageEvents(s, e, a);
    }
  };

  return treeDir;

});
