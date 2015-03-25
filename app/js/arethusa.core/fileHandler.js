"use strict";

angular.module('arethusa.core').service('fileHandler', [
  '$window',
  function($window) {
    var uploader, downloader;

    this.upload = upload;
    this.download = download;

    // Only supports JSON uploads so far!
    function upload(cb, type) {
      if (!angular.isDefined($window.FileReader)) {
        /* global alert */
        alert("Your browser does not support this feature - use Chrome, Firefox or Opera");
        return;
      }

      if (!uploader) {
        uploader = document.createElement('input');
        uploader.setAttribute('type', 'file');
        uploader.addEventListener('change', onFileSelectFn(cb, type));
      }
      simulateClick(uploader);
    }

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

        simulateClick(downloader);
    }

    function createUrl(blob) {
      return ($window.URL || $window.webkitURL).createObjectURL(blob);
    }

    function onFileSelectFn(cb, type) {
      return function(event) {
        var file = event.target.files[0];
        var reader = new $window.FileReader();
        reader.onload = function(event) {
          cb(parseFile(event.target.result, type));
        };
        reader.readAsText(file);
      };
    }

    function parseFile(file, type) {
      switch (type) {
        default:
          return JSON.parse(file);
      }
    }

    // Firefox cannot handle the click event correctly when the element
    // is not attached to the DOM - we therefore hack this temporarily
    function simulateClick(el) {
      document.body.appendChild(el);
      el.click();
      document.body.removeChild(el);
    }
  }
]);
