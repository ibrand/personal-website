/* File: gulpfile.js */

// grab our gulp packages
var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass');

// Create a default task and add the watch task to it
gulp.task('default', function () {
  gulp.watch('themes/curlew/scss/**/*.scss', ['sass']);
});

//////////////////////////////
// SASS Task
//////////////////////////////
gulp.task('sass', function () {
  return gulp.src('themes/curlew/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('themes/curlew/static/css/'));
});

return gutil.log('Gulp is running!')
