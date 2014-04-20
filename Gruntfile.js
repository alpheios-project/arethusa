var srcFiles = 'app/**/*.js';
var specFiles = 'spec/**/*.js';
var specE2eFiles = 'spec-e2e/**/*.js';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-protractor-webdriver');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jasmine: {
      src: srcFiles,
      options: {
        specs: specFiles,
        // helpers: 'spec/*Helper.js',
        // template: 'custom.tmpl'
      }
    },
    watch: {
      files: [srcFiles, specFiles],
      tasks: 'karma:spec:run'
    },
    jshint: {
      all: ['*.js', srcFiles, specFiles]
    },
    karma: {
      spec: {
        autoWatch: false,
        singleRun: true,
        options: {
          files : [
            './bower_components/angular/angular.js',
            './bower_components/angular-mocks/angular-mocks.js',
            srcFiles,
            specFiles
          ],
          frameworks: ['jasmine'],
          browsers : ['PhantomJS'],
          plugins : [
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
          ],
        }
      },
    },
    protractor: {
      options: {
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          specs: [ specE2eFiles ],
          capabilities: {
            'browserName': 'chrome'
          },
          seleniumAddress: "127.0.0.1:4444/wd/hub",
          // seleniumServerJar: ""
          // Arguments passed to the command
          framework: "jasmine",
          jasmineNodeOpts: {
            showColors: true, // Use colors in the command line report.
          }
        }
      },
    },
    protractor_webdriver: {
      startSelenium: {
        options: {
          command: 'webdriver-manager start'
        },
      },
    }
  });

  grunt.registerTask('default', ['karma:spec', 'jshint']);
};
