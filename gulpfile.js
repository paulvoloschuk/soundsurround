'use strict';

var gulp = require('gulp'),
  watch = require('gulp-watch'),
  prefixer = require('gulp-autoprefixer'),
  minify = require('gulp-minifier'),
  cssmin = require('gulp-minify-css'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  imagemin = require('gulp-imagemin'),
  concatCss = require('gulp-concat-css'),
  concat = require('gulp-concat'),
  htmlmin = require('gulp-htmlmin'),
  pngquant = require('imagemin-pngquant'),
  rigger = require('gulp-rigger'),
  rimraf = require('rimraf'),
  browserSync = require("browser-sync"),

  browserify = require('browserify'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  util = require('gulp-util'),

  reload = browserSync.reload;

var path = {
  build: {
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/img/',
    fonts: 'build/fonts/',
    audio: 'build/audio/',
    config: 'build/config/'
  },
  src: {
    html: 'src/templates/[^_]*.html',
    js: 'src/js/[^_]*.js',
    style: 'src/styles/**/[^_]*.*',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*',
    audio: 'src/audio/**/*.*',
    config: 'src/config/**/*.*'
  },
  watch: {
    html: 'src/templates/*.html',
    js: 'src/js/*.js',
    style: 'src/styles/**/*.*',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*',
    audio: 'src/audio/**/*.*',
    config: 'src/config/**/*.*'
  },
  clean: './build'
};
var config = {
  server: {
    baseDir: "./build/"
  },
  tunnel: true,
  host: 'localhost',
  port: 7000,
  logPrefix: "projectConfigurator"
};

gulp.task('html:build', function () {
  gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});
gulp.task('js:build', function () {
  return browserify({
    entries: 'src/js/index.js',
    debug: true,
    transform: [babelify.configure({
      presets: ['latest', 'minify']
    })]
  }).bundle()
    .pipe(source(path.src.js))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(rigger())
    .pipe(concat("main.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({stream: true}));
});
gulp.task('style:build', function () {
  gulp.src(path.src.style)
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(prefixer())
    // .pipe(concatCss("styles.css"))
    .pipe(cssmin())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true}));
});
gulp.task('image:build', function () {
  gulp.src(path.src.img)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});
gulp.task('audio:build', function() {
  gulp.src(path.src.audio)
    .pipe(gulp.dest(path.build.audio))
});
gulp.task('config:build', function() {
  gulp.src(path.src.config)
    .pipe(gulp.dest(path.build.config))
});
gulp.task('build', [
  'html:build',
  'js:build',
  'style:build',
  'fonts:build',
  'audio:build',
  'config:build',
  'image:build'
]);
gulp.task('watch', function(){
  watch([path.watch.html], function(event, cb) {
    gulp.start('html:build');
  });
  watch([path.watch.style], function(event, cb) {
    gulp.start('style:build');
  });
  watch([path.watch.js], function(event, cb) {
    gulp.start('js:build');
  });
  watch([path.watch.img], function(event, cb) {
    gulp.start('image:build');
  });
  watch([path.watch.fonts], function(event, cb) {
    gulp.start('fonts:build');
  });
  watch([path.watch.audio], function(event, cb) {
    gulp.start('audio:build');
  });
  watch([path.watch.config], function(event, cb) {
    gulp.start('config:build');
  });
});
gulp.task('webserver', function () {
  browserSync(config);
});
gulp.task('clean', function (cb) {
  rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);
