module.exports = function (grunt) {

    // load all grunt tasks
    require('jit-grunt')(grunt);

    grunt.initConfig({

        clean: {
            js: ['js/**/*', '!js/libs', '!js/libs/**/*'],
            dist: ['dist/*'],
            index: ['js/index.js'],
            zip: ['./*.zip']
        },

        ts: {
            default: {
                tsconfig: true
            }
        },

        copy: {
            dist: {
                files: [
                    {
                        src: 'index.html',
                        dest: 'dist/index.html'
                    },
                    {
                        src: 'js/main.js',
                        dest: 'dist/js/main.js'
                    },
                    {
                        expand: true,
                        src: 'assets/**/*',
                        dest: 'dist'
                    },
                    {
                        expand: true,
                        src: 'img/**/*',
                        dest: 'dist'
                    },
                    {
                        expand: true,
                        src: ['js/**/*.js'],
                        dest: 'dist'
                    },
                ]
            }
        },

        uglify: {
            dist: {
                files: {
                    'js/index.js': [
                        'js/**/*.js',
                        '!js/main.js',
                        '!js/libs/babylon.js'
                    ]
                }
            }
        },
        compress: {
            dist: {
                options: {
                    archive: 'simon3d_' + grunt.template.today('yyyymmdd-HHMMss') + '.zip',
                },
                files: [{
                    expand: true, cwd: 'dist/', src: ['**'], dest: '../'
                }]
            }
        }
    });

    grunt.registerTask('default', 'Uglify and compress all js files into one', [
        // Clean old dist
        'clean:js',
        'clean:dist',
        'clean:zip',
        'clean:index',

        // Compile
        'ts',

        // Create archive
        // 'uglify',
        'copy',
        'compress'
    ]);
    grunt.registerTask('scss', 'Compile scss files', [
        // Clean old dist
        'sass',
        'watch'
    ]);

};


