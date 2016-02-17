'use strict';

var argv = require('yargs').argv;
var bump = require('gulp-bump');
var conventionalChangelog = require('gulp-conventional-changelog');
var git = require('gulp-git');
var semver = require('semver');

module.exports = function(gulp, userConfig) {

  // default configuration
  var config = {
    versionNumber: argv.v,
    bumpFiles: ['./package.json', './bower.json'],
    changelogFile: './CHANGELOG.md',
    conventionalChangelog: 'angular',
    commitMessage: 'bump version number ' + argv.v,
    tagPrefix: '',
    masterBranch: 'master',
    developBranch: 'develop',
    origin: 'origin',
    releaseBranch: 'release/' + argv.v,
    push: false
  };

  // overwrite with user configuration
  if (userConfig && userConfig.release) {
    for (var configKey in userConfig.release) {
      config[configKey] = userConfig.release[configKey];
    }
  }


  // tasks
  gulp.task('bump', function() {
    if (!semver.valid(config.versionNumber)) {
      throw 'Failed: specify version "-v X.X.X';
    }

    return gulp.src(config.bumpFiles)
      .pipe(bump({version: config.versionNumber}))
      .pipe(gulp.dest('./'));
  });

  gulp.task('changelog', ['bump'], function() {
    return gulp.src(config.changelogFile)
      .pipe(conventionalChangelog({
        preset: config.conventionalChangelog
      }))
      .pipe(gulp.dest('./'));
  });

  gulp.task('createBranch', function(cb) {
    git.checkout(config.releaseBranch, {args: '-b'}, cb);
  });

  gulp.task('commit', ['bump', 'changelog', 'createBranch'], function() {
    var files = config.bumpFiles.concat(config.changelogFile);
    return gulp.src(files)
      .pipe(git.commit(config.commitMessage));
  });

  gulp.task('release', ['commit'], function(cb) {

    git.checkout(config.developBranch, {}, mergeInDevelop);

    function mergeInDevelop() {
      git.merge(config.releaseBranch, {args: '--no-ff'}, checkoutMaster);
    }

    function checkoutMaster() {
      git.checkout(config.masterBranch, {}, mergeInMaster);
    }

    function mergeInMaster() {
      git.merge(config.releaseBranch, {args: '--no-ff'}, tagVersion);
    }

    function tagVersion() {
      git.tag(config.tagPrefix + config.versionNumber, config.versionNumber, {}, deleteBranch);
    }

    function deleteBranch() {
      git.branch(config.releaseBranch, {args: '-d'}, pushBranches);
    }

    function pushBranches() {
      if (config.push) {
        git.push(config.origin, config.developBranch + ' ' + config.developBranch, {args: " --tags"}, checkoutDevelop);
      } else {
        cb();
      }
    }

    function checkoutDevelop() {
      git.checkout(config.developBranch, {}, cb);
    }
  });
};
