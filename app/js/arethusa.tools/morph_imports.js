"use strict";

angular.module('arethusa.tools').constant('MORPH_IMPORTS', [
  {
    name: 'Latin Morphology',
    language: 'lat',
    route: '...'
  },
  {
    name: 'Greek Morphology',
    language: 'grc',
    route: '...'
  },
  {
    name: 'Test Data from Vanessa',
    language: 'grc',
    route: 'http://www.perseids.org/morph/masterlocal.csv'
  }
]);
