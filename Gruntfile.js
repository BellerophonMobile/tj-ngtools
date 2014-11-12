'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable variables for the application
  var appConfig = {
      app: 'src',
      dist: 'dist',
      test: 'test',
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    appConfig: appConfig,

    watch: {
      files: 'src/**/*',
      tasks: 'build'
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 3000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= appConfig.app %>/**/*.js',
          '!<%= appConfig.app %>/**/*.spec.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: [
          '<%= appConfig.app %>/**/*.spec.js',
          'test/**/*.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= appConfig.dist %>/{,*/}*',
            '!<%= appConfig.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Generates CSS from LESS files
    less: {
      options: {
        banner: '/*! tjtools.less <%= meta.revision %> */',
        sourceMap: true,
        sourceMapFilename: '.tmp/styles/tjtools.less.map',
        sourceMapURL: 'tjtools.less.map',
        sourceMapRootpath: '/'
      },
      dist: {
        files: {
          '.tmp/styles/tjtools.less.css': '<%= appConfig.app %>/tjtools.less'
        }
      }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 2 versions'],
        map: true
      },
      dist: {
        files: {
          '<%= appConfig.dist %>/tjtools.css': '.tmp/styles/tjtools.less.css'
        }
      }
    },

    // Combine scripts into single JS file
    concat: {
      options: {
        sourceMap: true,
        banner: '/*! tjtools.js <%= meta.revision %> */'
      },
      dist: {
        src: [
          'src/**/*Module.js',
          'src/**/*.js',
          '!src/**/*.spec.js',
          '.tmp/templates.js'
        ],
        dest: '<%= appConfig.dist %>/tjtools.js'
      }
    },

    // ngAnnotate tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        src: '<%= appConfig.dist %>/tjtools.js',
        dest: '<%= appConfig.dist %>/tjtools.js'
      }
    },

    // Concatenates templates into a single JS file.
    ngtemplates: {
      options: {
        module: 'tj.templates',
        standalone: true,
        prefix: 'tj/',
        htmlmin: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        }
      },
      dist: {
        expand: false,
        cwd: '<%= appConfig.app %>',
        src: '**/*.html',
        dest: '.tmp/templates.js'
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      styles: {
        expand: true,
        cwd: '<%= appConfig.app %>',
        dest: '.tmp/styles/app',
        src: '**/*.less'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ]
    },

    // Unit test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    }
  });

  grunt.registerTask('test', ['test:unit']);

  grunt.registerTask('test:unit', [
    'clean:server',
    'revision',
    'concurrent:test',
    'less',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'revision',
    'less',
    'autoprefixer',
    'ngtemplates',
    'concat',
    'ngAnnotate',
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

};
