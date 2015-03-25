"use strict";

angular.module('arethusa.core').service('fileHandler', [
  '$window',
  function($window) {
    var downloader;

    this.download = download;

    function download(name, data, mimeType) {

        if (!downloader) downloader = document.createElement('a');

        // This should detect that Safari is used...
        if (!angular.isDefined(downloader.download)) {
          /* global alert */
          alert("Your browser does not support this feature - use Chrome, Firefox or Opera");
          return;
        }
        var blob = new Blob([data], { type: mimeType + ';charset=utf-8'});
        downloader.setAttribute('href', createUrl(blob));
        downloader.setAttribute('download', name);

        // Firefox cannot handle the click event correctly when the element
        // is not attached to the DOM - we therefore hack this temporarily
        document.body.appendChild(downloader);
        downloader.click();
        document.body.removeChild(downloader);
    }

    function createUrl(blob) {
      return ($window.URL || $window.webkitURL).createObjectURL(blob);
    }
  }
]);
