pkg = require './package.json'
gulp = require 'gulp'
$ = require('gulp-load-plugins')(pattern: [
  '*{-,.}*'
])


gulp.task 'scripts', ->
  gulp.src ['js/plugins/**.js','js/app/**.js','scripts/main.js']
  .pipe $.plumber errorHandler: $.notify.onError("Error: <%= error.message %>")
  .pipe $.concat 'scripts.min.js'
  # .pipe $.uglify()
  .pipe gulp.dest 'js'
  .pipe $.notify 'js up!'
  return

gulp.task 'browser-sync', ->
  $.browserSync.init
    open: true
    server: baseDir: '.'
    notify: false
  return



gulp.task 'default', ['browser-sync'], ->
  gulp.watch ['js/**.js'], ['scripts'], $.browserSync.reload
  gulp.watch ['*.html'], $.browserSync.reload
  return
