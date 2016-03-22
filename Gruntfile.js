"use strict";
var shell = require('shelljs');

// Z keeps constants and utility functions in an object
// Currently 4 modules:
// strings manipulates strings
// paths creates file paths
// modules provides functions on the list of modules
// files provides dynamic lists of different kinds of files
// misc is everything else that would pollute the Gruntfile namespace
var Z = {};
Z.var = {
  files:{
    src: 'app/**/*.js',
    html: 'app/**/*.html',
    css: 'app/**/*.scss',
    spec: 'spec/**/*.js',
    specE2e: 'spec-e2e/**/*.js',
    express: ['server/**/*', '!server/browser/**/*'],
    browserApp: ['server/browser/js/**/*'],
    versionInfo: 'app/js/arethusa/version.json'
  },
  modules: [
    "arethusa.constituents",
    'arethusa.morph',
    'arethusa.artificial_token',
    'arethusa.core',
    'arethusa.util',
    'arethusa.tools',
    'arethusa.comments',
    'arethusa.hebrew_morph',
    'arethusa.context_menu',
    //'arethusa.conf_editor',
    'arethusa.review',
    'arethusa.search',
    'arethusa.history',
    'arethusa.dep_tree',
    'arethusa.relation',
    'arethusa.exercise',
    'arethusa.sg',
    'arethusa.text',
    'arethusa.table'
  ],
  paths: {
    conf: 'app/static/configs/root_files',
    doc: 'docs',
    docCustom: 'docs/custom'
  },
  misc: {
    devMode: process.env.DEV,
    additionalDependencies: {
      'arethusa.comments' : [
        "./bower_components/marked/lib/marked.js",
        "./bower_components/angular-md/dist/angular-md.min.js",
      ]
    },
    ports: {
      dev: 8081,
      reload: 35279
    },
    banner: [
      '/*',
      ' * Arethusa - a backend-independent client-side annotation framework',
      ' * http://github.com/latin-language-toolkit/arethusa',
      ' *',
      ' * Version <%= versionInfo.version %>',
      ' * built from branch <%= versionInfo.branch %>',
      ' * at <%= versionInfo.sha %>',
      ' * on <%= versionInfo.date %>',
      ' *',
      ' * Published under the MIT license',
      ' */',
      ''
    ].join('\n')
  }
};
Z.fun = {
  strings: {
    capitalize: function(str) { return str[0].toUpperCase() + str.slice(1); },
    // Remove '_' and capitalize first letter of sub-strings to get script name
    toJsScript: function(str) {
      var parts = str.split('_');
      var res = [], part;
      for (var i = 0; i  < parts.length; i ++) {
        part = parts[i];
        if (i !== 0) part = Z.fun.strings.capitalize(part);
        res.push(part);
      }
      return res.join('');
    },
    // Remove leading 'arethusa.' from module name to get task name
    toTaskScript: function(str) { return Z.fun.strings.toJsScript(str.replace(/^arethusa\./, '')); }
  },
  paths: {
    toConcatPath: function(module) { return 'dist/' + module + '.concat.js'; },
    toMinPath: function(module) { return 'dist/' + module + '.min.js'; }
  },
  modules:{
    each: function(fn) {
      for (var i = Z.var.modules.length - 1; i >= 0; i--) { fn(Z.var.modules[i]); }
    }
  },
  files: {
    pluginFiles: function(name, destName, concat) {
      var pathFn = concat ? Z.fun.paths.toConcatPath : Z.fun.paths.toMinPath;
      var distName = pathFn(destName || name);
      var mainFile = 'app/js/' + name + '.js';
      var others = '<%= "app/js/' + name + '/**/*.js" %>';
      var templates = '<%= "app/js/templates/compiled/' + name + '.templates.js" %>';
      var targets = [mainFile, others, templates];
      var dependencies = Z.var.misc.additionalDependencies[name];
      if (dependencies) {
        targets = dependencies.concat(targets);
      }
      if (concat) {
        return {
          src: targets,
          dest: distName
        };
      } else {
        var obj = {};
        obj[distName] = targets;
        return obj;
      }
    },
    arethusaSourceFiles: function() {
      var sources = [
        "./bower_components/jquery/dist/jquery.min.js",
        "./bower_components/angular/angular.min.js",
        "./bower_components/angular-route/angular-route.min.js",
        "./vendor/angular-resource/angular-resource.min.js",
        "./bower_components/angular-cookies/angular-cookies.min.js",
        "./bower_components/angular-animate/angular-animate.min.js",
        "./bower_components/angular-scroll/angular-scroll.min.js",
        "./bower_components/angular-translate/angular-translate.min.js",
        "./bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js",
        "./bower_components/x2js/xml2json.min.js",
        "./bower_components/oclazyload/dist/ocLazyLoad.min.js",
        "./bower_components/angular-local-storage/dist/angular-local-storage.min.js",
        "./bower_components/lodash/dist/lodash.min.js",
        "./bower_components/stacktrace-js/dist/stacktrace.min.js",
        "./bower_components/angular-uuid2/dist/angular-uuid2.min.js",
        //"./vendor/angular-foundation-colorpicker/js/foundation-colorpicker-module.min.js",
        "./vendor/uservoice/uservoice.min.js",
        "./vendor/angularJS-toaster/toaster.min.js",
        "./bower_components/angular-highlightjs/angular-highlightjs.min.js",
        "./bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.min.js",
        "./vendor/highlight/highlight.pack.js"
      ];

      // Of some components there are no non-minified version available
      var alwaysMinified = [
        "./bower_components/angulartics/dist/angulartics.min.js",
        "./bower_components/angulartics/dist/angulartics-ga.min.js",
        "./vendor/mm-foundation/mm-foundation-tpls-0.2.2.custom.min.js",
        "./bower_components/angular-gridster/dist/angular-gridster.min.js"
      ];

      var result;
      if (Z.var.misc.devMode) {
        result = [];
        for (var i=0; i < sources.length; i++) {
          result.push(sources[i].replace(/min.js$/, 'js'));
        }
      } else {
        result = sources;
      }

      return result.concat(alwaysMinified);
    },
    arethusaMainFiles: function() {
      var files = [
        "arethusa.util",
        "arethusa.core",
        "arethusa.tools",
        "arethusa.context_menu",
        "arethusa.history",
        "arethusa.main"
      ];
      var res = [];
      for (var i=0; i < files.length; i++) { res.push(Z.fun.paths.toConcatPath(files[i])); }
      return res;
    },
    confFiles: function(grunt) { return grunt.file.expand(Z.var.paths.conf + '/*.json'); }
  },
  misc: {
    createVersionInfo: function() {
      function shellOneLineOutput(command) { return shell.exec(command, { silent: true }).output.replace(/(\r\n|\n|\r)/gm, ''); }
      var sha    = shellOneLineOutput('git rev-parse HEAD');
      var branch = shellOneLineOutput('git rev-parse --abbrev-ref HEAD');
      var date = new Date().toJSON();
      return { sha: sha, branch: branch, date: date };
    },
    getReloadPort: function () { return ++Z.var.misc.ports.reload; }
  }
};

function arethusaUglify() {
  var obj = {
    options: {
      sourceMap: true,
      banner: Z.var.misc.banner
    },
    dagred3: { files: { "vendor/dagre-d3/dagre-d3.min.js": "vendor/dagre-d3/dagre-d3.js"} },
    uservoice: { files: { "vendor/uservoice/uservoice.min.js": "vendor/uservoice/uservoice.js"} },
    toasts: { files: { "vendor/angularJS-toaster/toaster.min.js": "vendor/angularJS-toaster/toaster.js"} },
    templates: { files: { "dist/templates.min.js": "app/js/templates/compiled/*.js"} },
    app: { files: { "dist/arethusa.min.js": "dist/arethusa.concat.js"} }
  };

  Z.fun.modules.each(function(module) {
    var target = {};
    target[Z.fun.paths.toMinPath(module)] = Z.fun.paths.toConcatPath(module);
    obj[Z.fun.strings.toTaskScript(module)] = { files: target };
  });
  return obj;
}

function arethusaConcat() {
  var obj = {};
  Z.fun.modules.each(function(module) { obj[Z.fun.strings.toTaskScript(module)] = Z.fun.files.pluginFiles(module, null, true); });
  obj.packages = { src: Z.fun.files.arethusaSourceFiles(), dest: Z.fun.paths.toConcatPath('arethusa_packages') };
  obj.main = Z.fun.files.pluginFiles('arethusa', 'arethusa.main', true);
  obj.app = { src: Z.fun.files.arethusaMainFiles(), dest: Z.fun.paths.toConcatPath('arethusa') };
  obj.browserApp = { src: Z.var.files.browserApp, dest: 'dist/file_browser_app.concat.js' };
  return obj;
}

function arethusaCopy() {
  function toCopyObject(name) { return { src: Z.fun.paths.toConcatPath(name), dest: Z.fun.paths.toMinPath(name) }; }
  var obj = {};
  obj.app   = toCopyObject('arethusa');
  obj.packages = toCopyObject('arethusa_packages');
  Z.fun.modules.each(function(module) { obj[Z.fun.strings.toTaskScript(module)] = toCopyObject(module); });
  return obj;
}

/**
 * Build task names for uglify process
 */
function uglifyTasks() {
  var res = [
    'newer:ngtemplates',
    'newer:concat'
  ];

  // We don't need newer for copy - the overhead of asking if it should run is more than just doing it.
  var task = Z.var.misc.devMode ? 'copy' : 'newer:uglify';
  Z.fun.modules.each(function(module) { res.push([task, Z.fun.strings.toTaskScript(module)].join(':')); });
  res.push(task + ':app');
  res.push('copy:packages');

  return res;
}

function arethusaTemplates() {
  var obj = {
    arethusa: {
      cwd: "app",
      src: "js/templates/*.html",
      dest: "app/js/templates/compiled/arethusa.templates.js"
    }
  };
  // arethusa.util does not come with templates
  Z.fun.modules.each(function(module) { if (module != 'arethusa.util') { obj[Z.fun.strings.toJsScript(module)] = templateObj(module); } });
  return obj;
}

function templateObj(module) {
  return {
    cwd: "app",
    src: 'js/' + module + '/templates/**/*.html',
    dest: "app/js/templates/compiled/" + module + '.templates.js'
  };
}

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  function confMergeCommands() {
    var file, target, cmd, cmds = [];
    var files = Z.fun.files.confFiles(grunt);
    for (var i = files.length - 1; i >= 0; i--){
      file = files[i];
      target = file.replace(Z.var.paths.conf, 'dist/configs');
      cmd = 'arethusa merge ' + file + ' -mb app > ' + target;
      cmds.push(cmd);
    }
    return cmds;
  }

  Z.var.misc.dev = grunt.option('port') || Z.var.misc.dev;
  var packageJson = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: packageJson,
    versionInfo: grunt.file.exists(Z.var.files.versionInfo) ? grunt.file.readJSON(Z.var.files.versionInfo) : {},
    jasmine: {
      src: Z.var.files.src,
      options: {
        specs: Z.var.files.spec
        // helpers: 'spec/*Helper.js',
        // template: 'custom.tmpl'
      }
    },
    watch: {
      default: {
        files: [Z.var.files.src, Z.var.files.spec],
        tasks: 'default'
      },
      spec: {
        files: [Z.var.files.src, Z.var.files.spec],
        tasks: 'spec'
      },
      server: {
        files: [Z.var.files.src, Z.var.files.html, Z.var.files.css],
        tasks: 'minify:all',
        options: {
          livereload: Z.var.misc.ports.reload
        }
      },
      serverNoCss: {
        files: [Z.var.files.src, Z.var.files.html],
        tasks: 'minify',
        options: {
          livereload: Z.var.misc.ports.reload,
          spawn: false
        }
      },
      serverCss: {
        files: Z.var.files.css,
        tasks: 'minify:css',
        options: {
          spawn: false
        }
      },
      conf: {
        files: 'app/static/configs/**/*',
        tasks: 'minify:conf',
        options: {
          spawn: false
        }
      },
      e2e: {
        files: [Z.var.files.src, Z.var.files.specE2e],
        tasks: 'protractor:all'
      },
      doc: {
        files: [Z.var.files.src, Z.var.paths.docCustom + '/ngdoc/**/*.ngdoc', Z.var.paths.docCustom + '/css/*.css' ],
        tasks: ['plato', 'ngdocs'],
        options: {
          livereload: Z.var.misc.ports.reload,
          spawn: false
        }
      },
      browserApp: {
        files: Z.var.files.browserApp,
        tasks: ['concat:browserApp']
      }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      all: ['*.js', Z.var.files.src, Z.var.files.spec, './dist/i18n/*.json']
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
            './vendor/angular-resource/angular-resource.js',
            './bower_components/angular-cookies/angular-cookies.js',
            './bower_components/angular-animate/angular-animate.js',
            './bower_components/angular-scroll/angular-scroll.js',
            './bower_components/angular-translate/angular-translate.js',
            './bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
            './bower_components/angulartics/dist/angulartics.min.js',
            './bower_components/angulartics/dist/angulartics-ga.min.js',
            './bower_components/x2js/xml2json.min.js',
            './bower_components/jquery/dist/jquery.min.js',
            './bower_components/d3/d3.min.js',
            './bower_components/lunr.js/lunr.min.js',
            './bower_components/oclazyload/dist/ocLazyLoad.min.js',
            './bower_components/angular-gridster/dist/angular-gridster.min.js',
            './bower_components/javascript-detect-element-resize/jquery.resize.js',
            './bower_components/angular-uuid2/dist/angular-uuid2.min.js',
            './vendor/angular-foundation-colorpicker/js/foundation-colorpicker-module.js',
            './vendor/mm-foundation/mm-foundation-tpls-0.1.0.min.js',
            './vendor/dagre-d3/dagre-d3.min.js',
            './vendor/angularJS-toaster/toaster.min.js',
            "./vendor/highlight/highlight.pack.js",
            "./bower_components/angular-highlightjs/angular-highlightjs.min.js",
            "./bower_components/angular-local-storage/dist/angular-local-storage.min.js",
            "./bower_components/lodash/dist/lodash.min.js",
            "./bower_components/stacktrace-js/dist/stacktrace.min.js",
            "./bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.min.js",
            // Some source files we'll need to include manually, otherwise
            // the load order is wrong
            'app/js/*.js',
            'app/js/arethusa*/**/*.js',
            'dist/templates.min.js',
            Z.var.files.spec
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
              {type: 'lcov'}
            ]
          }
        }
      }
    },
    coveralls: {
      src: 'coverage/**/lcov.info'
    },
    protractor: {
      options: {
        keepAlive: false, // If false, the grunt process stops when the test fails.
        noColor: false // If true, protractor will not use colors in its output.
      },
      all: {
        options: {
          configFile: './protractor-config.js'
        }
      }
    },
    express: {
      options: {
        script: 'server/app.js',
        background: false,
        port: Z.var.misc.ports.dev
      },
      server: {}
    },
    sauce_connect: {
      your_target: {
        options: {
          username: 'balmas',
          accessKey: 'ae469ad7-eaf1-4c87-b165-c3f32d27d64a',
          verbose: true
        }
      }
    },
    uglify: arethusaUglify(),
    sass: {
      dist: {
        options: {
          sourcemap: true
        },
        files: {
          'app/css/arethusa.css': 'app/css/arethusa.scss'
        }
      }
    },
    cssmin: {
      css: {
        src: [
          'bower_components/angular-gridster/dist/angular-gridster.min.css',
          'app/css/arethusa.css',
          'app/css/fonts/**/*.css'
        ],
        dest: 'dist/arethusa.min.css'
      }
    },
    githooks: {
      precommit: {
        options: {
          'template': 'hooks/staging_only.js'
        },
        'pre-commit': 'default'
      },
      update: {
        options: {
          template: 'hooks/update.js'
        },
        'post-merge': true,
        'post-checkout': true
      }
    },
    ngtemplates: arethusaTemplates(),
    shell: {
      minifyConfs: {
        command: confMergeCommands().join('&')
      },
      install: {
        command: [
          'bower install',
          'gem install sass -v 3.3.14',
          'gem install arethusa-client -v 0.1.17'
        ].join('&&')
      },
      e2eSetup: {
        command: './node_modules/protractor/bin/webdriver-manager update'
      },
      currentCommit: {
        command: 'git rev-parse HEAD'
      },
      plato: {
        command: [
          'rm -rf ' + Z.var.paths.docCustom + '/plato',
          'node_modules/.bin/plato -d ' + Z.var.paths.docCustom + '/plato -l .jshintrc -r -t "Arethusa JS Source Analysis" app/js/**/* > /dev/null'
        ].join(';')
      },
      cloneExampleRepo: {
        command: 'git clone git@github.com:latin-language-toolkit/arethusa-example-data.git data/examples'
      },
      cloneAuxConfigs: {
        command: 'git clone git@github.com:latin-language-toolkit/arethusa-configs.git data/aux_configs'
      }
    },
    concurrent: {
      minifyAll: {
        tasks: ['minify:css', 'minify', 'minify:conf']
      },
      watches: {
        tasks: ['reloader:no-css', 'reloader:conf', 'reloader:css', 'watch:browserApp'],
        options: {
          logConcurrentOutput: true
        }
      },
      server: {
        tasks: ['concurrent:watches', 'minify:all', 'express:server'],
        options: {
          logConcurrentOutput: true
        }
      },
      docs: {
        tasks: ['ngdocs', 'watch:doc', 'express:server'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    concat: arethusaConcat(),
    copy: arethusaCopy(),
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false
      }
    },
    clean: {
      dist: ['dist/*.js', 'dist/*.map'],
      docs: [ 'css', 'font', 'grunt-scripts', 'index.html', 'js', 'partials'].map(function(file) { return Z.var.paths.doc + '/' + file; })
    },
    ngdocs: {
      options: {
        dest: Z.var.paths.doc,
        scripts: [
          './dist/arethusa_packages.min.js',
          './dist/arethusa.min.js'],
        html5Mode: false,
        title: 'Arethusa',
        titleLink: 'http://arethusa.latin-language-toolkit.net',
        navTemplate: Z.var.paths.docCustom + '/html/nav.html',
        sourcePath: 'http://github.com/latin-language-toolkit/arethusa/tree/doc',
        styles: [ Z.var.paths.docCustom + '/css/styles.css' ]
      },
      api: {
        src: [
          Z.var.files.src,
          Z.var.paths.docCustom + '/ngdoc/api/*.ngdoc'
        ],
        title: 'API Documentation'
      },
      core_guide: {
        src: Z.var.paths.docCustom + '/ngdoc/core_guide/*.ngdoc',
        title: 'Core Guide'
      },
      plugin_guide: {
        src: Z.var.paths.docCustom + '/ngdoc/plugin_guide/*.ngdoc',
        title: 'Plugin Guide'
      }
    }
  });

  grunt.registerTask('version', function() {
    var template = grunt.file.read('./app/js/arethusa/.version_template.js');
    var versionInfo = Z.fun.misc.createVersionInfo();
    versionInfo.version = packageJson.version;
    grunt.file.write(Z.var.files.versionInfo, JSON.stringify(versionInfo));
    var result = grunt.template.process(template, { data: versionInfo });
    grunt.file.write('./app/js/arethusa/version.js', result);
  });

  grunt.registerTask('default', ['karma:spec', 'jshint']);
  grunt.registerTask('spec', 'karma:spec');
  grunt.registerTask('e2e', 'protractor:all');

  grunt.registerTask('plato', 'shell:plato');

  // These three server tasks are usually everything you need!
  grunt.registerTask('server', ['clean:dist', 'version', 'minify:all', 'express:server']);
  grunt.registerTask('reloading-server', ['clean:dist', 'version', 'concurrent:server']);
  grunt.registerTask('doc-server', ['concurrent:docs']);

  grunt.registerTask('reloader', 'concurrent:watches');
  grunt.registerTask('reloader:no-css', 'watch:serverNoCss');
  grunt.registerTask('reloader:conf', 'watch:conf');
  grunt.registerTask('reloader:css', 'watch:serverCss');

  grunt.registerTask('minify:css', ['sass', 'cssmin:css']);
  grunt.registerTask('minify:conf', 'shell:minifyConfs');
  grunt.registerTask('minify', uglifyTasks());
  grunt.registerTask('minify:all', 'concurrent:minifyAll');

  grunt.registerTask('install', 'shell:install');
  grunt.registerTask('e2e:setup', 'shell:e2eSetup');
  grunt.registerTask('sauce', ['sauce_connect', 'protractor:travis', 'sauce-connect-close']);

  grunt.registerTask('import', ['shell:cloneExampleRepo', 'shell:cloneAuxConfigs']);
};
