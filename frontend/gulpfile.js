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

// copy 3rd party deps
gulp.task('clean', function () {
    gulp.src(['./build/compiled', './build/compressed'], {
            read: false
        })
        .pipe(clean({
            force: true
        }));
});

//slightly compile elements into Compiled
gulp.task('compile', [], function () {
    gulp.src('./src/**/*.ts')
      .pipe(ts({
          //noImplicitAny: true,
          target: "ES6",
          out: 'custom.js'
      }))
      .pipe(gulp.dest('./build/compiled/js'));

    gulp.src('./src/**/style.less')
      .pipe(less({
          paths: [path.join(__dirname, 'less', 'includes')]
      }))
      .pipe(gulp.dest('./build/compiled'));

    gulp.src('./src/js/lib/*.js')
      .pipe(concat("combined.js"))
      .pipe(gulp.dest('./build/compiled/js/'));

    gulp.src('./src/*.html')
      .pipe(useref())
      .pipe(gulp.dest('./build/compiled/'));


});

gulp.task('compress', ['compile'], function () {
    gulp.src('./build/compiled/*.html')
      .pipe(gulp.dest('./build/compressed/'));

    gulp.src('./build/compiled/css/*.css')
        .pipe(gulp.dest('./build/compressed/css'));
    gulp.src('./build/compiled/js/*.js')
      .pipe(stripDebug())
      .pipe(gulp.dest('./build/compressed/js'));
});

gulp.task('gzip', ['compress'], function () {
    gulp.src('./build/compressed/**/*.*')
      .pipe(pako.gzip())
      //.pipe(rename({extname: ""}))
      .pipe(gulp.dest("./build/gziped/"));
});

//////////////////

gulp.task('watch', function () {
    console.log('watch');
});
