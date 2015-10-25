import fs from 'fs';
import gulp from 'gulp';
import gutil from 'gulp-util';
import jade from 'gulp-jade';
import rename from 'gulp-rename';
import zip from 'gulp-zip';
import webpack from 'webpack';

/*
 * common tasks
 */
gulp.task('replace-webpack-code', () => {
  const replaceTasks = [{
    from: './webpack/replace/JsonpMainTemplate.runtime.js',
    to: './node_modules/webpack/lib/JsonpMainTemplate.runtime.js'
  }, {
    from: './webpack/replace/log-apply-result.js',
    to: './node_modules/webpack/hot/log-apply-result.js'
  }];
  replaceTasks.forEach(task => fs.writeFileSync(task.to, fs.readFileSync(task.from)));
});

/*
 * dev tasks
 */

gulp.task('webpack:dev', (callback) => {
  let myConfig = Object.create(require('./webpack/dev.config'));
  webpack(myConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:dev', err);
    }
    gutil.log('[webpack:dev]', stats.toString({ colors: true }));
  });
  callback();
});

gulp.task('views:dev', () => {
  gulp.src('./src/browser/views/*.jade')
    .pipe(jade({
      locals: { env: 'dev' }
    }))
    .pipe(gulp.dest('./dev'));
});

gulp.task('copy:dev', () => {
  gulp.src('./src/browser/extension/manifest.json')
    .pipe(rename('manifest.json'))
    .pipe(gulp.dest('./dev'));
});

/*
 * build tasks
 */

gulp.task('webpack:build:extension', (callback) => {
  let myConfig = Object.create(require('./webpack/prod.config'));
  webpack(myConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack:build', err);
    }
    gutil.log('[webpack:build]', stats.toString({ colors: true }));
    callback();
  });
});

gulp.task('views:build:extension', () => {
  gulp.src([
    './src/browser/views/*.jade'
  ])
    .pipe(jade({
      locals: { env: 'prod' }
    }))
    .pipe(gulp.dest('./build/extension'));
});

gulp.task('copy:build:extension', () => {
  gulp.src('./src/browser/extension/manifest.json')
    .pipe(rename('manifest.json'))
    .pipe(gulp.dest('./build/extension'));
});

gulp.task('copy:build:firefox', ['build:extension'], () => {
  gulp.src('./build/extension/**').pipe(gulp.dest('./build/firefox'))
    .on('finish', function() {
      gulp.src('./src/browser/firefox/manifest.json')
        .pipe(gulp.dest('./build/firefox'));
    });
});

/*
 * compress task
 */

gulp.task('compress:extension', () => {
  gulp.src('build/extension/*')
    .pipe(zip('extension.zip'))
    .pipe(gulp.dest('./build'));
});

gulp.task('compress:firefox', () => {
  gulp.src('build/firefox/**')
    .pipe(zip('firefox.xpi'))
    .pipe(gulp.dest('./build'));
});

gulp.task('default', ['replace-webpack-code', 'webpack:dev', 'views:dev', 'copy:dev']);
gulp.task('build:extension', ['replace-webpack-code', 'webpack:build:extension', 'views:build:extension', 'copy:build:extension']);
gulp.task('build:firefox', ['copy:build:firefox']);
