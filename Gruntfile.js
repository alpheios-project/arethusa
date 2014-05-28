"use strict";

var srcFiles = 'app/**/*.js';
var htmlFiles = 'app/**/*.html';
var cssFiles = 'app/**/*.css';
var specFiles = 'spec/**/*.js';
var specE2eFiles = 'spec-e2e/**/*.js';
var devServerPort = 8084;
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

var pluginFiles = function(name) {
  var minName = 'dist/' + name + '.min.js';
  var mainFile = 'app/js/' + name + '.js';
  var others = '<%= "app/js/' + name + '/**/*.js" %>';
  var obj = {};
  obj[minName] = [mainFile, others];
  return obj;
};

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-sauce-connect-launcher');
  grunt.loadNpmTasks('grunt-contrib-uglify');
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
      spec: {
        files: [srcFiles, specFiles],
        tasks: 'spec'
      },
      serverSource: {
        files: srcFiles,
        tasks: 'minify',
        options: {
          livereload: true
        }
      },
      serverHtml: {
        files: htmlFiles,
        options: {
          livereload: true
        }
      },
      serverCss: {
        files: cssFiles,
        options: {
          livereload: true
        }
      },

      e2e: {
        files: [srcFiles, specE2eFiles],
        tasks: 'protractor:all'
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
            './bower_components/angular-resource/angular-resource.js',
            './bower_components/x2js/xml2json.min.js',
            './bower_components/jquery/dist/jquery.min.js',
            './bower_components/d3/d3.min.js',
            './vendor/angular-foundation-colorpicker/js/foundation-colorpicker-module.js',
            './vendor/mm-foundation/mm-foundation-tpls-0.1.0.min.js',
            './vendor/dagre-d3/dagre-d3.min.js',
            // Some source files we'll need to include manually, otherwise
            // the load order is wrong
            'app/js/other/history_obj.js',
            'app/js/*.js',
            'app/js/arethusa*/**/*.js',
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
        keepAlive: false, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
      },
      all: {
        options: {
          args: {
            seleniumAddress: 'http://localhost:4444/wd/hub',
            capabilities: { 'browserName': 'chrome' },
            specs: [specE2eFiles],
            baseUrl: 'http://localhost:' + devServerPort
          }},
      }, // A target needs to be defined, otherwise protractor won't run
      travis: {
        options: {
          args: {
            sauceUser: 'arethusa',
            sauceKey: '8e76fe91-f0f5-4e47-b839-0b04305a5a5c',
            specs: [specE2eFiles],
            baseUrl: 'http://localhost:' + devServerPort,
            capabilities: {
              /* global process:true */
              'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
              'build': process.env.TRAVIS_BUILD_NUMBER
            }
          }
        }
      }
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
      },
    },
    sauce_connect: {
      your_target: {
        options: {
          username: 'arethusa',
          accessKey: '8e76fe91-f0f5-4e47-b839-0b04305a5a5c',
          verbose: true
        }
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        report: 'gzip'
      },
      core: { files: pluginFiles('arethusa.core') },
      contextMenu: { files: pluginFiles('arethusa.context_menu') },
      confEditor: { files: pluginFiles('arethusa.conf_editor') },
      morph: { files: pluginFiles('arethusa.morph') },
      review: { files: pluginFiles('arethusa.review') },
      search: { files: pluginFiles('arethusa.search') },
      depTree: { files: pluginFiles('arethusa.dep_tree') },
      hist: { files: pluginFiles('arethusa.hist') },
      relation: { files: pluginFiles('arethusa.relation') },
      exercise: { files: pluginFiles('arethusa.exercise') }
    }
  });

  grunt.registerTask('default', ['karma:spec', 'jshint']);
  grunt.registerTask('spec', 'karma:spec');
  grunt.registerTask('e2e', 'protractor:all');
  grunt.registerTask('server', 'connect:devserver');
  grunt.registerTask('minify', [
    'uglify:core',
    'uglify:morph',
    'uglify:contextMenu',
    'uglify:confEditor',
    'uglify:review',
    'uglify:search',
    'uglify:depTree',
    'uglify:hist',
    'uglify:relation',
    'uglify:exercise'
  ]);
  grunt.registerTask('sauce', ['sauce_connect', 'protractor:travis', 'sauce-connect-close']);
};
