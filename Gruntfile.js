var srcFiles = 'src/**/*.js';
var specFiles = 'spec/**/*.js';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
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
      tasks: 'jasmine'
    },
    jshint: {
      all: ['*.js', srcFiles, specFiles]
    }
  });
  grunt.registerTask('default', ['jasmine', 'jshint']);
};
