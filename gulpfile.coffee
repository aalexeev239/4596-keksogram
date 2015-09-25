pkg = require './package.json'
gulp = require 'gulp'
$ = require('gulp-load-plugins')(pattern: [
  '*{-,.}*'
])


gulp.task 'js', ->
  gulp.src ['js/lib/**.js','js/app/**.js','js/main.js']
  .pipe $.plumber errorHandler: $.notify.onError("Error: <%= error.message %>")
  .pipe $.concat 'scripts.min.js'
  # .pipe $.uglify()
  .pipe gulp.dest 'js'
  .pipe $.notify 'js up!'
  return

gulp.task('js-watch', ['js'], $.browserSync.reload);

gulp.task 'browser-sync', ->
  $.browserSync.init
    open: true
    server: baseDir: '.'
  return




gulp.task 'default', ['browser-sync'], ->
  gulp.watch ['js/lib/**.js','js/app/**.js','js/main.js'], ['js-watch']
  gulp.watch ['*.html'], $.browserSync.reload
  return
