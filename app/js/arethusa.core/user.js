"use strict";

angular.module('arethusa.core').factory('User', [
  function() {
    return function(args) {
      this.name     = args.name;
      this.fullName = args.fullName;
      this.mail     = args.mail;
      this.page     = args.page;
    };
  }
]);
