module.exports = function (grunt) {

    // load all grunt tasks
    require('jit-grunt')(grunt);

    grunt.initConfig({

        // Watches content related changes
        watch: {
            sass: {
                files: ['scss/**/*.scss'],
                tasks: ['sass', 'postcss']
            }
        },

        // Sass compilation. Produce an extended css file in css folder
        sass: {
            options: {
                sourcemap: 'none',
                style: 'expanded'
            },
            dist: {
                files: {
                    'css/index.css': 'scss/main.scss'
                }
            }
        },
        // Auto prefixer css
        postcss: {
            dist: {
                options: {
                    processors: [
                        require('autoprefixer')({ browsers: 'last 2 versions' }),
                        require('cssnano')()
                    ]
                },
                src: 'css/index.css'
            }
        },

        clean: {
            js: ['js/**/*', '!js/libs', '!js/libs/**/*'],
            css: ['css/index.css'],
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
                        src: 'index.dist.html',
                        dest: 'dist/index.html'
                    },
                    {
                        src: 'css/index.css',
                        dest: 'dist/css/index.css'
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
                        src: 'fonts/**/*',
                        dest: 'dist'
                    },
                    {
                        expand: true,
                        src: 'img/**/*',
                        dest: 'dist'
                    },
                    {
                        expand: true,
                        // src: ['js/libs/*', 'js/index.js'],
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
                        'js/ONEBOSSGame.js',
                        'js/home/HTMLState.js',
                        'js/**/*.js',
                        '!js/main.js',
                        '!js/libs/phaser-ce.min.js',
                        '!js/libs/swipe.js',
                        '!js/libs/phaser-state-transition.min.js'
                    ]
                }
            }
        },
        compress: {
            dist: {
                options: {
                    archive: '1boss_' + grunt.template.today('yyyymmdd-HHMMss') + '.zip',
                },
                files: [{
                    expand: true, cwd: 'dist/', src: ['**'], dest: '../'
                }]
            }
        },
        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'img/',
                    src: ['**/*.{png,jpg}'],
                    dest: 'testimg/'
                }]
            }
        }
    });

    grunt.registerTask('default', 'Uglify and compress all js files into one', [
        // Clean old dist
        'clean:js',
        'clean:css',
        'clean:dist',
        'clean:zip',
        'clean:index',

        // Compile
        'ts',
        'sass',

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


