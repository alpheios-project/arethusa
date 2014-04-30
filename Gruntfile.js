"use strict";

var srcFiles = 'app/**/*.js';
var htmlFiles = 'app/**/*.html';
var specFiles = 'spec/**/*.js';
var specE2eFiles = 'spec-e2e/**/*.js';
var devServerPort = 8084;
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-coveralls');
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
      default: {
        files: [srcFiles, specFiles],
        tasks: 'default'
      },
      server: {
        files: [srcFiles, htmlFiles],
        options: {
          livereload: true
        }
      }
    },
    jshint: {
      options: {
        jshintrc: true,
      },
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
            './bower_components/angular-route/angular-route.js',
            './vendor/mm-foundation/mm-foundation-tpls-0.1.0.min.js',
            srcFiles,
            specFiles
          ],
          frameworks: ['jasmine'],
          browsers : ['PhantomJS'],
          plugins : [
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-coverage'
          ],
          reporters: ['progress', 'coverage'],
          preprocessors: {
            'app/**/*.js': ['coverage']
          },
          coverageReporter: {
            reporters: [
              {type: 'html', dir:'coverage/'},
              {type: 'lcov'},
            ]
          }
        }
      },
    },
    coveralls: {
      src: 'coverage/**/lcov.info'
    },
    protractor: {
      options: {
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          seleniumAddress: 'http://localhost:4444/wd/hub',
          capabilities: { 'browserName': 'chrome' },
          specs: [specE2eFiles],
          baseUrl: 'http://localhost:' + devServerPort
        },
      },
      all: {}, // A target needs to be defined, otherwise protractor won't run
    },
    connect: {
      devserver: {
        options: {
          port: devServerPort,
          debug: true,
          keepalive: true,
          livereload: true,
          middleware: function(connect) {
            return [
              require('connect-livereload')(),
              mountFolder(connect, './')
            ];
          }
        }
      }
    }
  });

  grunt.registerTask('default', ['karma:spec', 'jshint']);
  grunt.registerTask('server', 'connect');
};
