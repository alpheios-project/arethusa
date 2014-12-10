'use strict';

angular.module('arethusa').constant('VERSION', {
  revision: '<%= sha %>',
  branch: '<%= branch %>',
  date: '<%= date %>',
  repository: 'http://github.com/latin-language-toolkit/arethusa'
});
