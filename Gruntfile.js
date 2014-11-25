"use strict";

var shell = require('shelljs');

var srcFiles = 'app/**/*.js';
var htmlFiles = 'app/**/*.html';
var cssFiles = 'app/**/*.scss';
var specFiles = 'spec/**/*.js';
var specE2eFiles = 'spec-e2e/**/*.js';
var devServerPort = 8081;
var reloadPort = 35279;
var confPath = 'app/static/configs';

var devMode = process.env.DEV;

var arethusaModules = [
  "arethusa.constituents",
  'arethusa.morph',
  'arethusa.artificial_token',
  'arethusa.core',
  'arethusa.util',
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
  'arethusa.text'
];

var additionalDependencies = {
  'arethusa.comments' : [
    "./bower_components/marked/lib/marked.js",
    "./bower_components/angular-md/dist/angular-md.min.js",
  ]
};

function shellOneLineOutput(command) {
  var output = shell.exec(command, { silent: true }).output;
  return output.replace(/(\r\n|\n|\r)/gm, '');
}

function eachModule(fn) {
  for (var i = arethusaModules.length - 1; i >= 0; i--){
    fn(arethusaModules[i]);
  }
}

function arethusaSourceFiles() {
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
    //"./vendor/angular-foundation-colorpicker/js/foundation-colorpicker-module.min.js",
    "./vendor/uservoice/uservoice.min.js",
    "./vendor/angularJS-toaster/toaster.min.js",
    "./bower_components/angular-highlightjs/angular-highlightjs.min.js",
    "./vendor/highlight/highlight.pack.js",
  ];

  // Of some components there are no non-minified version available
  var alwaysMinifified = [
    "./bower_components/angulartics/dist/angulartics.min.js",
    "./bower_components/angulartics/dist/angulartics-ga.min.js",
    "./vendor/mm-foundation/mm-foundation-tpls-0.2.2.custom.min.js",
    "./bower_components/angular-gridster/dist/angular-gridster.min.js",
  ];

  var result;
  if (devMode) {
    result = [];
    for (var i=0; i < sources.length; i++) {
      result.push(sources[i].replace(/min.js$/, 'js'));
    }
  } else {
    result = sources;
  }

  return result.concat(alwaysMinifified);
}

function arethusaMainFiles() {
  var files = [
    "arethusa.util",
    "arethusa.core",
    "arethusa.context_menu",
    "arethusa.history",
    "arethusa.main"
  ];

  var res = [];
  for (var i=0; i < files.length; i++) {
    res.push(toConcatPath(files[i]));
  }
  return res;
}

function arethusaUglify() {
  var obj = {
    options: {
      sourceMap: true
    },
    dagred3: { files: { "vendor/dagre-d3/dagre-d3.min.js": "vendor/dagre-d3/dagre-d3.js"} },
    uservoice: { files: { "vendor/uservoice/uservoice.min.js": "vendor/uservoice/uservoice.js"} },
    toasts: { files: { "vendor/angularJS-toaster/toaster.min.js": "vendor/angularJS-toaster/toaster.js"} },
    templates: { files: { "dist/templates.min.js": "app/templates/compiled/*.js"} },
    app: { files: { "dist/arethusa.min.js": "dist/arethusa.concat.js"} }
  };

  eachModule(function(module) {
    var target = {};
    target[toMinPath(module)] = toConcatPath(module);
    obj[toTaskScript(module)] = { files: target };
  });
  return obj;
}

function arethusaConcat() {
  var obj = {};
  var sourceFiles = arethusaSourceFiles();
  var mainFiles = arethusaMainFiles();

  eachModule(function(module) {
    obj[toTaskScript(module)] = pluginFiles(module, null, true);
  });

  obj.packages = { src: sourceFiles, dest: toConcatPath('arethusa_packages') };
  obj.main = pluginFiles('arethusa', 'arethusa.main', true);
  obj.app = { src: mainFiles, dest: toConcatPath('arethusa') };

  return obj;
}

function toCopyObject(name) {
  return { src: toConcatPath(name), dest: toMinPath(name) };
}

function arethusaCopy() {
  var obj = {};
  obj.app   = toCopyObject('arethusa');
  obj.packages = toCopyObject('arethusa_packages');

  eachModule(function(module) {
    obj[toTaskScript(module)] = toCopyObject(module);
  });

  return obj;
}

function uglifyTasks() {
  var res = [
    'newer:ngtemplates',
    'newer:concat',
  ];

  // We don't need newer for copy - the overhead of asking
  // if it should run is more than just doing it.
  var task = devMode ? 'copy' : 'newer:uglify';
  eachModule(function(module) {
    res.push([task, toTaskScript(module)].join(':'));
  });

  res.push(task + ':app');
  res.push('copy:packages');

  return res;
}

function arethusaTemplates() {
  var obj = {
    arethusa: {
      cwd: "app",
      src: "templates/*.html",
      dest: "app/templates/compiled/arethusa.templates.js"
    }
  };

  eachModule(function(module) {
    obj[toJsScript(module)] = templateObj(module);
  });

  return obj;
}

function templateObj(module) {
  return {
    cwd: "app",
    src: 'templates/' + module + '/**/*.html',
    dest: "app/templates/compiled/" + module + '.templates.js'
  };
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function toJsScript(str) {
  var parts = str.split('_');
  var res = [], part;
  for (var i = 0; i  < parts.length; i ++) {
    part = parts[i];
    if (i !== 0) part = capitalize(part);
    res.push(part);
  }
  return res.join('');
}

function toTaskScript(str) {
  return toJsScript(str.replace(/^arethusa\./, ''));
}

function toConcatPath(module) {
  return 'dist/' + module + '.concat.js';
}

function toMinPath(module) {
  return 'dist/' + module + '.min.js';
}


function getReloadPort() {
  reloadPort++;
  return reloadPort;
}

function pluginFiles(name, destName, concat) {
  var pathFn = concat ? toConcatPath : toMinPath;
  var distName = pathFn(destName || name);
  var mainFile = 'app/js/' + name + '.js';
  var others = '<%= "app/js/' + name + '/**/*.js" %>';
  var templates = '<%= "app/templates/compiled/' + name + '.templates.js" %>';
  var targets = [mainFile, others, templates];
  var dependencies = additionalDependencies[name];
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
}

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  function confFiles() {
    return grunt.file.expand(confPath + '/*.json');
  }

  function confMergeCommands() {
    var file, target, cmd, cmds = [];
    var files = confFiles();
    for (var i = files.length - 1; i >= 0; i--){
      file = files[i];
      target = file.replace(confPath, 'dist/configs');
      cmd = 'arethusa merge ' + file + ' -m > ' + target;
      cmds.push(cmd);
    }
    return cmds;
  }

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
      server: {
        files: [srcFiles, htmlFiles, cssFiles],
        tasks: 'minify:all',
        options: {
          livereload: reloadPort
        }
      },
      serverNoCss: {
        files: [srcFiles, htmlFiles],
        tasks: 'minify',
        options: {
          livereload: reloadPort,
          spawn: false
        }
      },
      serverCss: {
        files: cssFiles,
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
            './vendor/angular-foundation-colorpicker/js/foundation-colorpicker-module.js',
            './vendor/mm-foundation/mm-foundation-tpls-0.1.0.min.js',
            './vendor/dagre-d3/dagre-d3.min.js',
            './vendor/angularJS-toaster/toaster.min.js',
            "./vendor/highlight/highlight.pack.js",
            "./bower_components/angular-highlightjs/angular-highlightjs.min.js",
            "./bower_components/angular-local-storage/dist/angular-local-storage.min.js",
            "./bower_components/lodash/dist/lodash.min.js",
            // Some source files we'll need to include manually, otherwise
            // the load order is wrong
            'app/js/*.js',
            'app/js/arethusa*/**/*.js',
            'dist/templates.min.js',
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
          configFile: './protractor-config.js'
        },
      }
    },
    connect: {
      server: {
        options: {
          port: devServerPort,
          debug: true,
          keepalive: true
        }
      },
      devServer: {
        options: {
          port: devServerPort,
          debug: true,
          keepalive: true,
          livereload: reloadPort
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
          'gem install arethusa-cli'
        ].join('&&')
      },
      e2eSetup: {
        command: './node_modules/protractor/bin/webdriver-manager update'
      },
      currentCommit: {
        command: 'git rev-parse HEAD'
      }
    },
    concurrent: {
      minifyAll: {
        tasks: ['minify:css', 'minify', 'minify:conf']
      },
      watches: {
        tasks: ['reloader:no-css', 'reloader:conf', 'reloader:css'],
        options: {
          logConcurrentOutput: true
        }
      },
      server: {
        tasks: ['concurrent:watches', 'minify:all', 'connect:devServer'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    concat: arethusaConcat(),
    copy: arethusaCopy(),
    clean: ['dist/*.js', 'dist/*.map']
  });

  grunt.registerTask('version', function() {
    var template = grunt.file.read('./app/js/arethusa/.version_template.js');
    var sha    = shellOneLineOutput('git rev-parse HEAD');
    var branch = shellOneLineOutput('git rev-parse --abbrev-ref HEAD');
    var args = { data: { sha: sha, branch: branch } };
    var result = grunt.template.process(template, args);
    grunt.file.write('./app/js/arethusa/version.js', result);
  });

  grunt.registerTask('default', ['karma:spec', 'jshint']);
  grunt.registerTask('spec', 'karma:spec');
  grunt.registerTask('e2e', 'protractor:all');

  // These two server tasks are usually everything you need!
  grunt.registerTask('server', ['clean', 'version', 'minify:all', 'connect:server']);
  grunt.registerTask('reloading-server', ['clean', 'version', 'concurrent:server']);

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
};
