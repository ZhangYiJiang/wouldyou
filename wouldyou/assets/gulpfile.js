"use strict";

// Import gulp plugins 
const gulp = require('gulp');
const newer = require('gulp-newer');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const gulpIf = require('gulp-if');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sourcemap = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');

// Import other dependencies 
const _ = require("lodash");
const browsersync = require('browser-sync').create();
const argv = require("yargs").argv;
const path = require('path');

// Import config and set up env 
const config = require('./config.json');
const env = config.environments[argv.env || config.env];

const filename = (name, ext) => {
  return name + (env.minify ? '.min.' : '.') + ext;
};

const out = (name) => path.join(env.out, name);

gulp.task('js', () => {
  gulp.src(config.in.js)
    .pipe(newer(config.in.js))
    .pipe(sourcemap.init())
    .pipe(gulpIf(env.minify, uglify()))
    .pipe(concat(filename(config.out.js.name, 'js')))
    .pipe(gulpIf(env.sourcemap, sourcemap.write('.')))
    .pipe(gulp.dest(out(config.out.js.path))); 
});

gulp.task('img', () => {
  gulp.src(config.in.img)
    .pipe(newer(config.in.img))
    .pipe(gulp.dest(out(config.out.img)));
});

gulp.task('sass', () => {
  const processors = [
    require('autoprefixer'),
  ];

  gulp.src(config.in.sass.file)
    .pipe(sourcemap.init())
    .pipe(sass({
      outputStyle: env.minify ? 'compressed' : 'expanded',
      includePaths: ['node_modules/bootstrap-sass/assets/stylesheets/',],
      sourceMapContents: true,
    }).on('error', sass.logError))
    .pipe(rename(filename(config.out.sass.name, 'css')))
    .pipe(postcss(processors))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest(out(config.out.sass.path)))
    .pipe(browsersync.stream({ match: '**/*.css' }));
});

gulp.task('build', ['img', 'js', 'sass',]);

gulp.task('watch', ['build',], () => {
  gulp.watch(config.in.img, ['img']);
  gulp.watch(config.in.js, ['js']);
  gulp.watch(config.in.sass.path, ['sass']);
});

gulp.task('serve', ['watch'], () => {
  browsersync.init({
    open: false,
    proxy: argv.server || config.server,
  });

  gulp.watch(config.templates).on('change', browsersync.reload);
  gulp.watch(path.join(out(config.out.js.path), '**/*.js'), browsersync.reload);
  gulp.watch(path.join(out(config.out.img), '**/*'), browsersync.reload);
});