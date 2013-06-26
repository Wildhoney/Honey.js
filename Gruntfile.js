module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['packages/honey.js/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> by <%= pkg.author %> created on <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                src: ['packages/honey.js/default.js', 'packages/honey.js/collection.js', 'packages/honey.js/controller.js',
                      'packages/honey.js/factory.js', 'packages/honey.js/utils.js', 'packages/honey.js/view.js'],
                dest: 'dist/<%= pkg.name %>.<%= pkg.version %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> by <%= pkg.author %> created on <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: ['dist/<%= pkg.name %>.<%= pkg.version %>.js'],
                dest: 'dist/<%= pkg.name %>.<%= pkg.version %>.min.js'
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                options: {
                    paths: 'packages/honey.js/',
                    outdir: 'docs/'
                }
            }
        },
        jasmine: {
            pivotal: {
                src: ['dist/<%= pkg.name %>.<%= pkg.version %>.min.js'],
                options: {
                    specs: 'tests/spec.js',
                    helpers: ['node_modules/mustache/mustache.js', 'node_modules/crossfilter/crossfilter.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'yuidoc', 'jasmine']);

};