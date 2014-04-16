var srcFiles = 'src/**/*.js';
var specFiles = 'spec/**/*.js';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.initConfig({
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
/*        options: {
          files: [
            './node_modules/angular/lib/angular.min.js',
            specFiles,
          ],
        },
       */
        configFile: 'karma.conf.js',
        autoWatch: false,
        singleRun: true
        /*background: true,
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        plugins: [
          'karma-phantomjs-launcher',
          'karma-jasmine'
        ]
       */
      },
    }
  });
  grunt.registerTask('default', ['jasmine', 'jshint']);
};
