var pkg = require('./package.json');
var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('js-watch', browserSync.reload);

gulp.task('browser-sync', function() {
  browserSync.init({
    open: true,
    server: {
      baseDir: '.'
    }
  });
});

gulp.task('default', ['browser-sync'], function() {
  gulp.watch(['js/**/*.js'], ['js-watch']);
  gulp.watch(['*.html'], browserSync.reload);
});
