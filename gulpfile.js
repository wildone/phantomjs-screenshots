var gulp            = require('gulp-help')(require('gulp')),
    gutil           = require('gulp-util'),
    fs              = require('fs'),
    debug           = require('gulp-debug'),
    shell           = require('gulp-shell'),
    gulpif          = require('gulp-if'),
    rev             = require('gulp-rev'),
    print           = require('gulp-print'),
    foreach         = require('gulp-foreach'),
    each            = require('gulp-each'),
    prettyjson      = require('prettyjson'),
    path            = require('path'),
    childProcess    = require('child_process'),
    phantomjs         = require('phantomjs-prebuilt'),
    zip             = require('gulp-zip');


var config = {
    dirs        : {
        app     : 'app',
        backup  : 'backup',
        dist    : 'dist'
    },
    scripts     : {
        doPng   : 'app/**/*.js',
        doResp  : 'app/**/*.js'
    },
    package     : {
        file : 'app.zip'
    },
    urlsrc      : 'urls.txt',
    excludeVendor: gutil.env.excludeVendor || false,
    debug: gutil.env.debug || true,
    cucumber: gutil.env.cucumber || false,
    protractor: gutil.env.protractor || true,
    backup      : {
        file    : 'backup.zip',
        include : [
            './dist/**/*'
        ]
    },
    showAllTask: false,
    jsonOption:  {
        noColor: false
    }
};


/***************************************************************
 *** MAIN
 ***************************************************************/

var runGulpManually = false;
var isWin = /^win/.test(process.platform);

(function main() {

    defaultTasks();

    publicTasks();

    var options = process.argv.slice(2);

    try {
        if (process.pkg.entrypoint) {
            gutil.log("Running in container process.");
            runGulpManually = true;
        }
    } catch (ex) {
    }

    if (options!="") {

        if (gulp.hasTask(options)) {


            gutil.log("Starting with configurables:");
            //gutil.log(prettyjson.render(config, config.jsonOption));

            if (runGulpManually) {
                gutil.log("Running task: " + options);
                gulp.start(options);
            }

        } else {
            gutil.log("Task [" + options + "] not found.");
            gulp.start("help");
        }
    } else {
        if (runGulpManually) {
            gutil.log("Running task: run");
            gutil.log("Local Dir:" + __dirname)
            gulp.start("run");
        }

    }

})();


/***************************************************************
 *** DEFAULT TASK FUNCTIONS
 ***************************************************************/

function defaultTasks() {
    gulp.task('default', config.showAllTask && "Remove temp dirs", ['help']);
    gulp.task('debug', config.showAllTask && "Run Debug mode", shell.task(["gulp --require time-require --sorted"]));

}

/***************************************************************
 *** PUBLIC TASK FUNCTIONS
 ***************************************************************/


function publicTasks() {

    gulp.task('test', "Backup project files into a zip file...so handy!", function()  {
        gutil.log('TEST');
    });

    gulp.task('backup', "Backup project files into a zip file...so handy!", function()  {
        gutil.log('Backup project files into '+config.dirs.backup+'/'+config.backup.file+'');
        return gulp.src(config.backup.include)
            .pipe(gulpif(config.debug,print()))
            .pipe(zip(config.backup.file))
            .pipe(rev())
            .pipe(gulp.dest(config.dirs.backup));
    });

    gulp.task('run', "Run process", function()  {
        return gulp.src(config.urlsrc)
            .pipe(each(function(content, file, callback) {

                var linesArray = content.split('\n');
                for (var i = 0; i< linesArray.length; i++) {
                    if (linesArray[i]!="") {
                        var urlline = linesArray[i];

                        var urlparams = urlline.split(" ");

                        var url = "";
                        var urlauth = "";
                        if (urlparams.length == 1) {
                            url = urlparams[0];
                        }

                        if (urlparams.length == 2) {
                            url = urlparams[0];
                            urlauth = urlparams[1];
                        }

                        gutil.log("URL: " + url);
                        gutil.log("URL AUTH: " + urlauth.replace(/([a-zA-Z0-9])/g,"*")); //mask for print
                        var binPath =  phantomjs.path;

                        gutil.log(binPath);

                        if (isWin) {
                            binPath =  path.join(".","phantomjs.exe");
                        } else {
                            binPath =  path.join(".","phantomjs");
                        }

                        gutil.log(binPath);

                        fs.stat(binPath, function (err, stat) {
                            if (err != null) {
                                console.error("Need phantomjs executable in current folder");
                            }
                        });

                        var scriptPath = path.join(".", "urlResponsive2png.js");

                        fs.stat(scriptPath, function (err, stat) {
                            if (err != null) {
                                console.error("Need script [urlResponsive2png.js] in current folder");
                            }
                        });

                        var childArgs = [
                            scriptPath,
                            url, config.dirs.dist, urlauth
                        ];


                        childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
                            // handle results
                            if (err) {
                                gutil.log("err: " + err);
                            }
                            if (stderr) {
                                gutil.log("err: " + stderr);
                            }
                            gutil.log("out: " + stdout);
                        });

                    }
                }
            }));

    });

}


