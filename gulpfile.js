'use strict'

// 3rd-party modules

var browserify = require('browserify')
var buffer = require('vinyl-buffer')
var gulp = require('gulp')
var source = require('vinyl-source-stream')

// this module

gulp.task('build:lib', [], function () {
  var main = './loadjs.js'
  var b = browserify({ entries: main, standalone: 'loadjs' })
  return b.bundle()
    .pipe(source(main))
    .pipe(buffer())
    .pipe(gulp.dest('./dist'))
})

gulp.task('build:tests', [], function () {
  var main = './tests/index.js'
  var b = browserify({ entries: main })
  return b.bundle()
    .pipe(source(main))
    .pipe(buffer())
    .pipe(gulp.dest('./dist'))
})

gulp.task('default', ['build:lib', 'build:tests'], function () {})
