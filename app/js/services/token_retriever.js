annotationApp.service('tokenRetriever', function($http) {
  this.getData = function(callback) {
    var result;
    request = $.ajax({
      url: './static/tokens.json',
      async: false
    });

    request.done(callback);
  };
});
