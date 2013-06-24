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
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> by <%= pkg.author %> created on <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: ['packages/honey.js/*.js'],
                dest: 'dist/<%= pkg.name %>.min.js'
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
                src: ['packages/honey.js/*.js'],
                options: {
                    specs: 'tests/spec.js',
                    helpers: ['node_modules/mustache/mustache.js', 'node_modules/crossfilter/crossfilter.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'uglify']);

};