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
  '$window',
  function($window) {
    function createUrl(blob) {
      return ($window.URL || $window.webkitURL).createObjectURL(blob);
    }

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

        var downloader;
        scope.download = function() {
          if (!downloader) downloader = document.createElement('a');

          // This should detect that Safari is used...
          if (!angular.isDefined(downloader.download)) {
            /* global alert */
            alert("Your browser does not support this feature - use Chrome, Firefox or Opera");
            return;
          }
          var blob = new Blob([scope.data()], { type: scope.obj.mimeType + ';charset=utf-8'});
          var fileName = scope.obj.identifier + '.' + scope.obj.fileType;
          downloader.setAttribute('href', createUrl(blob));
          downloader.setAttribute('download', fileName);

          // Firefox cannot handle the click event correctly when the element
          // is not attached to the DOM - we therefore hack this temporarily
          document.body.appendChild(downloader);
          downloader.click();
          document.body.removeChild(downloader);
        };
      },
      templateUrl: 'templates/arethusa.core/outputter_item.html',
    };
  }
]);
