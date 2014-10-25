var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var watch = require('gulp-watch');
var connect = require('connect');
var serveStatic = require('serve-static');
var less = require('gulp-less');
var ngAnnotate = require('gulp-ng-annotate');
var buffer = require("vinyl-buffer");
var header = require("gulp-header");

var paths = {
  out : 'out/',
  scripts : {
    all : ['src/**/*.js'],
    paths : ['./src/'],
    apps : {
      //target: source pairs
      'app1.js' : './app1.js',
      'app2.js' : './app2.js'
    },
    basedir : 'src/'
  },
  resources : {
    src : ['src/**/*.html']
  },
  less : {
    src : ['src/**/*.less'],
    outFile : 'style.css'
  }
};

gulp.task('browserify', function() {
  Object.keys(paths.scripts.apps).forEach(function(target) {
    var entry = paths.scripts.apps[target];
    return browserify({
      entries : [entry],
      debug : true, //Must be true to presever ngInject annotations
      paths : paths.scripts.paths,
      basedir : paths.scripts.basedir
    })
    .bundle()
    .pipe(source(target))
    .pipe(buffer())
    .pipe(ngAnnotate())
    .pipe(header("function ngInject(a){return a;}"))
    .pipe(gulp.dest(paths.out));
  });
});

gulp.task('copy-resources', function() {
  return gulp.src(paths.resources.src)
    .pipe(gulp.dest(paths.out));
});

gulp.task('compile-less', function() {
  return gulp.src(paths.less.src)
    .pipe(less())
    .pipe(gulp.dest(paths.out + paths.less.outFile));
});

gulp.task('watch', function() {
  watch(paths.scripts.all, function(files) {
    gulp.start('browserify');
  });
  watch(paths.resources.src)
    .pipe(gulp.dest(paths.out));
  watch(paths.less.src, function(files) {
    gulp.start('compile-less');
  });
});

gulp.task('live', ['default', 'watch'], function() {
  connect().use(serveStatic(__dirname + '/' + paths.out)).listen(8080);
});
gulp.task('serve', function() {
  connect().use(serveStatic(__dirname + '/' + paths.out)).listen(8080);
});

gulp.task('default', ['copy-resources', 'compile-less', 'browserify']);
