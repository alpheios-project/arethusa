'use strict';
/* Draws a dependencyTree
 *
 * Can be used in isolation and awaits tokens passed into it, which have
 * a head.id property.
 *
 * Styling of the tree can be customized by passing a styles object as
 * attribute.
 * This object should be a dictionary of token ids with style information
 * in three categories: edge, label and token.
 * These properties should hold regular css style information. Example
 *
 *   {
 *     '0001' : {
 *       edge: { stroke: 'blue' },
 *       token: { color: 'white' }
 *     }
 *   } *
 * This would draw the edge of the token 0001 one blue and the textual
 * representation of the token itself in white.
 *
 * Tokens are rendered by the token directive. If no styles object has
 * been passed to the dependencyTree directive, the token itself will
 * decide its styling.
 * Hover and click events for tokens are activated. An option to customize
 * this will follow.
 *
 * Watches are in effect for changes of a tokens head.id value, changes
 * in the styles object, as well as in the tokens object.
 *
 * Example, given a tokens and a styles object in the current scope:
 *
 *   <div dependency-tree tokens="tokens" styles="styles/>
 *
 * The element carrying the directive can contain additional html elements.
 * They will be rendered on top of the tree's SVG canvas and are therefore
 * a good option to add additional control elements. The directive uses this
 * space itself and will place some span elements there.
 *
 */

angular.module('arethusa.depTree').directive('dependencyTree', [
  'Tree',
  function (Tree) {
    return {
      restrict: 'A',
      scope: {
        tokens: '=',
        styles: '='
      },
      link: function (scope, element, attrs) {
        var tree = new Tree(scope, element, {
          mainAttribute: 'head.id',
          parentPlugin: 'depTree',
          syntheticRoot: true
        });

        tree.launch();
      },
    };
  }
]);
