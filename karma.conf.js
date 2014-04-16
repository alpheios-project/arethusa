module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      './bower_components/angular/angular.js',
      './bower_components/angular-mocks/angular-mocks.js',
      'src/**/*.js',
      'spec/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],

    plugins : [
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-firefox-launcher',
      'karma-jasmine'
    ],

  });
};
