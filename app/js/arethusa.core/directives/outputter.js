"use strict";

angular.module('arethusa.core').directive('outputter', [
  '$modal',
  'saver',
  'translator',
  function($modal, saver, translator) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        scope.saver = saver;
        element.bind('click', function() {
          $modal.open({
            templateUrl: 'templates/arethusa.core/outputter.html',
            windowClass: 'full-modal',
            scope: scope
          });
        });

        translator('saver.previewAndDownload', function(trsl) {
          element.attr('title', trsl());
        });
      },
      template: '<i class="fa fa-download"/>'
    };
  }
]);

angular.module('arethusa.core').directive('outputterItem', [
  'fileHandler',
  '$window',
  function(fileHandler, $window) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.addClass('item');

        // This scope will be destroyed once the modal is destroyed.
        // When a user wants to look at a document once, we can therefore
        // cache it - it can never go out of sync, because making changes
        // to it would require leaving the modal.
        var data;
        scope.data = function() {
          if (!data) data = scope.obj.output();
          return data;
        };

        scope.togglePreview = function() { scope.preview = !scope.preview; };

        scope.download = function() {
          var fileName = scope.obj.identifier + '.' + scope.obj.fileType;
          var mime = scope.obj.mimeType;

          fileHandler.download(fileName, scope.data(), mime);
        };
      },
      templateUrl: 'templates/arethusa.core/outputter_item.html',
    };
  }
]);
