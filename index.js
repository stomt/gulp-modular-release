'use strict';

var argv = require('yargs').argv;
var bump = require('gulp-bump');
var conventionalChangelog = require('gulp-conventional-changelog');
var git = require('gulp-git');
var semver = require('semver');

module.exports = function(gulp) {
  var versionNumber = argv.v;
  var releaseBranch = 'release/' + versionNumber;

  gulp.task('bump', function() {
    if (!semver.valid(versionNumber)) {
      throw 'Failed: specify version "-v X.X.X';
    }

    return gulp.src(['./package.json', './bower.json'])
      .pipe(bump({version: versionNumber}))
      .pipe(gulp.dest('./'));
  });

  gulp.task('changelog', ['bump'], function() {
    return gulp.src('./CHANGELOG.md')
      .pipe(conventionalChangelog({
        preset: 'angular'
      }))
      .pipe(gulp.dest('./'));
  });

  gulp.task('createBranch', function() {
    return git.checkout(releaseBranch, {args: '-b'});
  });

  gulp.task('commit', ['bump', 'changelog', 'createBranch'], function() {
    return gulp.src(['./bower.json', './package.json', './CHANGELOG.md'])
      .pipe(git.commit('bump version number ' + versionNumber));
  });

  gulp.task('release', ['commit'], function(cb) {

    git.checkout('develop', {}, mergeInDevelop);

    function mergeInDevelop() {
      git.merge(releaseBranch, {args: '--no-ff'}, checkoutMaster);
    }

    function checkoutMaster() {
      git.checkout('master', {}, mergeInMaster);
    }

    function mergeInMaster() {
      git.merge(releaseBranch, {args: '--no-ff'}, tagVersion);
    }

    function tagVersion() {
      git.tag('v' + versionNumber, versionNumber, {}, deleteBranch);
    }

    function deleteBranch() {
      git.branch(releaseBranch, {args: '-d'}, cb);
    }
  });
};
