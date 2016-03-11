//'use strict';
//sample: https://github.com/ChiperSoft/express-boilerplate/blob/master/gulpfile.js

var gulp = require('gulp');
var pako = require('gulp-pako');
var rename = require("gulp-rename");
var concat = require("gulp-concat");

var less = require('gulp-less');
var path = require('path');

var typescript = require('gulp-tsc');
var ts = require('gulp-typescript');
var useref = require('gulp-useref');

var clean = require('gulp-clean');
var stripDebug = require('gulp-strip-debug');

// copy 3rd party deps
gulp.task('copy-deps', function() {
  gulp.src(['./node_modules/d3/d3.min.js'])
    .pipe(gulp.dest('./src/js/lib'));
});

// copy 3rd party deps
gulp.task('clean', function() {
  return gulp.src(['./build/compiled', './build/compressed'], {
      read: false
    })
    .pipe(clean({
      force: true
    }));
});

//slightly compile elements into Compiled
gulp.task('compile', ['copy-deps'], function() {
  gulp.src('./src/**/*.ts')
    .pipe(ts({
      noImplicitAny: true,
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

  //stripdebug
  gulp.src('./build/compiled/js/*.js')
    .pipe(stripDebug())
    .pipe(gulp.dest('./build/compiled/js-noconsole'));
});

gulp.task('gzip', ['compile'], function() {
  gulp.src('./build/compiled/**/*.*')
    .pipe(pako.gzip())
    //.pipe(rename({extname: ""}))
    .pipe(gulp.dest("./build/compressed/"));
});

//////////////////

gulp.task('watch', function() {
  console.log('watch');
});
