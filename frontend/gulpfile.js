//'use strict';
//sample: https://github.com/ChiperSoft/express-boilerplate/blob/master/gulpfile.js

//require("any-promise/register")
require("any-promise/register/bluebird")

var endOfLine = require('os').EOL;
var path = require('path');

var gulp = require('gulp');
var pako = require('gulp-pako');
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var less = require('gulp-less');

var ts = require('gulp-typescript');
var useref = require('gulp-useref');
var cssmin = require('gulp-cssmin');
var jsmin = require('gulp-minify');
var htmlmin = require('gulp-html-minifier');

var clean = require('gulp-clean');
var stripDebug = require('gulp-strip-debug');
var inject = require('gulp-inject');
var injectString = require('gulp-inject-string');

var merge = require('merge-stream');

// copy 3rd party deps
gulp.task('clean', function () {
    return gulp.src(['./build/'], {
        read: false
    })
        .pipe(clean({
            force: true
        }));
});

gulp.task('compile-ts', [], function () {
    return gulp.src('./src/**/*.ts')
      .pipe(ts({
          //noImplicitAny: true,
          target: "ES5",
      }))
      .pipe(gulp.dest('./src/'));
});

//slightly compile elements into Compiled
gulp.task('compile', [], function () {
    var p1 = gulp.src('./src/**/*.ts')
      .pipe(ts({
          //noImplicitAny: true,
          target: "ES5",
          out: 'custom.js'
      }))
      .pipe(gulp.dest('./build/compiled/js'));

    var p2 = gulp.src('./src/**/style.less')
      .pipe(less({
          paths: [path.join(__dirname, 'less', 'includes')]
      }))
      .pipe(gulp.dest('./build/compiled'));

    var p3 = gulp.src('./src/js/lib/*.js')
        .pipe(concat("combined.js"))
        .pipe(gulp.dest('./build/compiled/js/'));

    var p4 = gulp.src('./src/*.html')
        //.pipe(useref())
        .pipe(gulp.dest('./build/compiled/'));

    var p5 = gulp.src('./src/templates/*.html')
        .pipe(gulp.dest('./build/compiled/templates/'));

    return merge(p1, p2, p3, p4, p5);
});

gulp.task('pre-compress', ['compile'], function () {
    var pipes = [];
    pipes.push(gulp.src('./build/compiled/*.html')
        .pipe(gulp.dest('./build/pre-compressed/')));

    pipes.push(gulp.src('./build/compiled/Templates/*.html')
        .pipe(gulp.dest('./build/pre-compressed/includes/')));

    pipes.push(gulp.src('./build/compiled/css/*.css')
        .pipe(cssmin())
        .pipe(gulp.dest('./build/pre-compressed/includes')));

    pipes.push(gulp.src('./build/compiled/js/*.js')
        .pipe(stripDebug())
        .pipe(jsmin({ noSource: 1, ext: { min: '.js' } }))
        .pipe(gulp.dest('./build/pre-compressed/includes')));

    return merge(pipes);
});

//gulp.task('compress', [], function () {
gulp.task('compress', ['pre-compress'], function () {
    var pipes = [];

    pipes.push(gulp.src('./build/pre-compressed/index.html')
        //css
        .pipe(inject(gulp.src(["./build/pre-compressed/includes/*.css"]), {
            starttag: "<!-- replace:includes:css -->",
            endtag: "<!-- endreplace:includes:css -->",
            transform: function (filePath, file) {
                var result = '<style>' + endOfLine;
                result += file.contents.toString('utf8');
                result += endOfLine + '</style>';
                return result;
            }
        }))
        //external js
        .pipe(inject(gulp.src(["./build/pre-compressed/includes/combined.js"]), {
            starttag: "<!-- replace:includes:js -->",
            endtag: "<!-- endreplace:includes:js -->",
            transform: function (filePath, file) {
                var result = '<script language="javascript">' + endOfLine;
                result += file.contents.toString('utf8');
                result += endOfLine + '</script>';
                return result;
            }
        }))
        //templates
        .pipe(inject(gulp.src(['./build/pre-compressed/includes/*.html']), {
            starttag: "<!-- inject:includes:html -->",
            endtag: "<!-- endinject:includes:html -->",
            transform: function (filePath, file) {
                var name = path.basename(file.relative, ".html");
                var result = '<div class="templates ' + name + '">' + endOfLine;
                result += file.contents.toString('utf8');
                result += endOfLine + '</div>';
                return result;
            }
        }))
        //logic js
        .pipe(inject(gulp.src(["./build/pre-compressed/includes/custom.js"]), {
            starttag: "<!-- replace:includes:logic -->",
            endtag: "<!-- endreplace:includes:logic -->",
            transform: function (filePath, file) {
                var result = '<script language="javascript">' + endOfLine;
                result += file.contents.toString('utf8');
                result += endOfLine + '</script>';
                return result;
            }
        }))
        .pipe(htmlmin({ collapseWhitespace: true, removeComments:true,  }))
        .pipe(gulp.dest('./build/compressed/')));

    return merge(pipes);
});

gulp.task('gzip', ['compress'], function () {
    return gulp.src('./build/compressed/**/*.*')
      .pipe(pako.gzip())
      //.pipe(rename({extname: ""}))
      .pipe(gulp.dest("./build/gziped/"));
});

//////////////////

gulp.task('watch', function () {
    console.log('watch');
});
