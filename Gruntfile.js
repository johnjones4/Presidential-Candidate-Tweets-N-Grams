module.exports = function(grunt) {
    var uglify_files = {
        'public/build/app.js': [
            'public-dev/js/models/*',
            'public-dev/js/collections/*',
            'public-dev/js/views/*',
            'public-dev/js/app.js'
        ]
    };
    var sass_files = {
        'public/build/main.css' : 'public-dev/scss/main.scss'
    };
    var build_banner_text = ' <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd hh:mm:ss") %> ';
    var build_banner = '/*' + build_banner_text + '*/';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['./public/build'],
        uglify: {
            dist: {
                options: {
                    banner: build_banner+"\n"
                },
                files: uglify_files
            },
            dev: {
                options: {
                    compress: false,
                    mangle: false,
                    beautify: true
                },
                files: uglify_files
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none'
                },
                files: sass_files
            },
            dev: {
                options: {
                    style: 'expanded',
                    sourcemap: 'none'
                },
                files: sass_files
            }
        },
        watch: {
            css: {
                files: 'public-dev/scss/*.scss',
                tasks: ['sass:dev']
            },
            js: {
                files: 'public-dev/js/**',
                tasks: ['uglify:dev']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.registerTask('default', ['dev','watch']);
    grunt.registerTask('dev', ['uglify:dev','sass:dev']);
    grunt.registerTask('dist', ['clean','uglify:dist','sass:dist']);
}
