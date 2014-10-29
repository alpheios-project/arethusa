'use strict';

angular.module('arethusa').constant('VERSION', {
  sha: '<%= sha %>',
  date: '<%= new Date().toJSON() %>'
});
