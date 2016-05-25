"use strict";

const gulp  = require('gulp');
const babel = require('gulp-babel');
const less  = require('gulp-less');
const path  = require('path');
const cmd   = require('./sys/gulp-plugin/gulp-cmd');


const fs    = require('fs');

const livereload = require('gulp-refresh');

let paths = {
  scripts : ['resource/es6/**/*.js'],
  less    : ['resource/less/**/*.less'],
  refresh : ['resource/less/**/*.less','resource/es5/**/*.js','controller/*.js','view/*.html','view/**/*.html']
};

const PluginError = require('gulp-util').PluginError;

gulp.task('start', () => {

    gulp.watch(paths.scripts , es6to5);
    gulp.watch(paths.less    , compileLess);
    gulp.watch(paths.refresh , reload);

    livereload.listen();
});

gulp.task('default', ['start']);

/**
 * es2015 to es5
 */
function es6to5(event){
  gulp
  .src(paths.scripts)
  // .pipe(amd())
  .pipe(babel({
    presets:['es2015']
    // plugins:['transform-es2015-modules-amd']
  }))
  .on('error', function(err) {
        console.error(err.message);
        this.end();
   })
  .pipe(cmd())
  .pipe(gulp.dest('./resource/es5/'));


}

/**
 * 编译less
 */
function compileLess(event){
  // {  type: 'changed',
 //     path: '/Users/joe/ws-game/resource/less/index.less'
 //   }
  gulp.src(paths.less)
    .pipe(less({
      paths: [ path.join(__dirname, '/resource/less/') ]
    }))
    .on('error', function(err) {
        console.error(err.message);
        this.end();
    })
    .pipe(gulp.dest('./resource/css'));
}

function reload(event){
  gulp.src(event.path).pipe(livereload());
}