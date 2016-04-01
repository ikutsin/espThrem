//'use strict';
//sample: https://github.com/ChiperSoft/express-boilerplate/blob/master/gulpfile.js

var gulp = require('gulp');
var pako = require('gulp-pako');
var rename = require("gulp-rename");
var concat = require("gulp-concat");

var less = require('gulp-less');
var path = require('path');

var ts = require('gulp-typescript');
var useref = require('gulp-useref');

var clean = require('gulp-clean');
var stripDebug = require('gulp-strip-debug');

var merge = require('merge-stream');

// copy 3rd party deps
gulp.task('clean', function () {
    return gulp.src(['./build/compiled', './build/compressed'], {
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
      .pipe(useref())
      .pipe(gulp.dest('./build/compiled/'));

    var p5 = gulp.src('./src/templates/*.html')
      .pipe(gulp.dest('./build/compiled/templates/'));
	  

	return merge(p1,p2,p3,p4,p5);
});

gulp.task('compress', ['compile'], function () {
	var pipes = [];
    pipes.push(gulp.src('./build/compiled/**/*.html')
      .pipe(gulp.dest('./build/compressed/')));

    pipes.push(gulp.src('./build/compiled/css/*.css')
        .pipe(gulp.dest('./build/compressed/css')));
    pipes.push(gulp.src('./build/compiled/js/*.js')
      .pipe(stripDebug())
      .pipe(gulp.dest('./build/compressed/js')));
	  
	  return merge(pipes);
});

//gulp.task('gzip', ['compress'], function () {
gulp.task('gzip', function () {
    return gulp.src('./build/compressed/**/*.*')
      .pipe(pako.gzip())
      //.pipe(rename({extname: ""}))
      .pipe(gulp.dest("./build/gziped/"));
});

//////////////////

gulp.task('watch', function () {
    console.log('watch');
});
