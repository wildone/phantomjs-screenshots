module.exports = function (grunt) {
    'use strict';
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        assetsDir: 'app',
        distDir: 'dist',
        availabletasks: {
            tasks: {
                options: {
                    filter: 'include',
                    groups: {
                        'Development': ['test'],
                    },
                    sort: [
                        'test',
                        'clean'
                    ],
                    descriptions: {
                        'test': 'Launch the static server and watch tasks',
                    },
                    tasks: [
                        'test'
                    ]
                }
            }
        },
        clean: {
            dist: [
                '.tmp',
                '<%= distDir %>'
            ]
        },
        exec: {
            url2png: {
                cmd: 'phantomjs <%= assetsDir %>/url2png.js "http://maxbarrass.com" "<%= distDir %>/url2png"'
            },
            urlResponsive2png: {
                cmd: 'phantomjs <%= assetsDir %>/urlResponsive2png.js "http://maxbarrass.com" "<%= distDir %>/urlResponsive2png"'
            }
        }

    });
    grunt.registerTask('ls', ['availabletasks']);
    grunt.registerTask('test', [
        'exec'
    ]);
    grunt.registerTask('clean', [
        'clean'
    ]);

};
