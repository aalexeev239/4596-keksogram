pkg = require './package.json'
gulp = require 'gulp'
browserSync = require 'browser-sync'

gulp.task('js-watch', browserSync.reload);

gulp.task 'browser-sync', ->
  browserSync.init
    open: true
    server: baseDir: '.'
  return



gulp.task 'default', ['browser-sync'], ->
  gulp.watch ['js/**.js'], ['js-watch']
  gulp.watch ['*.html'], browserSync.reload
  return
