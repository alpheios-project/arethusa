'use strict';

angular.module('arethusa').constant('VERSION', {
  revision: '<%= sha %>',
  branch: '<%= branch %>',
  date: '<%= new Date().toJSON() %>',
  repository: 'http://github.com/latin-language-toolkit/arethusa'
});
