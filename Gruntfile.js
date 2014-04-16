module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.initConfig({
    jasmine: {
      customTemplate: {
        src: 'src/**/*.js',
        options: {
          specs: 'spec/*_spec.js',
          // helpers: 'spec/*Helper.js',
          // template: 'custom.tmpl'
        } } },
        watch: {
            files: ['src/**/*.js', 'spec/**/*.js'],
            tasks: 'jasmine' } 
    }
  );
  grunt.registerTask('default', ['jasmine']);
}
