'use strict';

var argv = require('yargs').argv;
var bump = require('gulp-bump');
var conventionalChangelog = require('gulp-conventional-changelog');
var conventionalRecommendedBump = require('conventional-recommended-bump');
var git = require('gulp-git');
var semver = require('semver');
var tap = require("gulp-tap");
var filter = require('gulp-filter');
var xmleditor = require('gulp-xml-editor');

module.exports = function(gulp, userConfig) {

  // default configuration
  var config = {
    versionNumber: argv.v,
    bumpFiles: ['./package.json', './bower.json'],
    changelogFile: './CHANGELOG.md',
    conventionalChangelog: 'angular',
    commitMessage: 'bump version number ',
    tagPrefix: '',
    masterBranch: 'master',
    developBranch: 'develop',
    origin: 'origin',
    releaseBranch: 'release/',
    push: false
  };

  // overwrite with user configuration
  if (userConfig && userConfig.release) {
    for (var configKey in userConfig.release) {
      config[configKey] = userConfig.release[configKey];
    }
  }


  // tasks
  gulp.task('bump', function(done) {
    if (config.versionNumber) {

      // use passed version number
      if (!semver.valid(config.versionNumber)) {
        throw 'Failed: specify a semver valid version "-v X.X.X';
      } else {
        var jsonFilter = filter('**/*.json');
        var xmlFilter = filter('**/*.xml');

        // bump json files using gulp-bump and xml files using gulp-xml-editor
        return gulp.src(config.bumpFiles)
            .pipe(jsonFilter)
            .pipe(bump({version: config.versionNumber}))
            .pipe(gulp.dest('./')) &&
          gulp.src(config.bumpFiles)
            .pipe(xmlFilter)
            .pipe(xmleditor([
              { path: '.', attr: { 'version': config.versionNumber } }
            ]))
            .pipe(gulp.dest('./'));
      }

    } else {

      // generate new version
      conventionalRecommendedBump({
        preset: config.conventionalChangelog
      }, function(err, releaseAs) {
        gulp.src(config.bumpFiles)
          .pipe(bump({type: releaseAs}))
          .pipe(gulp.dest('./'))
          .pipe(tap(function(file){
            // extract new version
            if (!config.versionNumber) {
              var json = JSON.parse(String(file.contents));
              config.versionNumber = json.version;
              console.log(config.versionNumber);
              done();
            }
          }));
      });

    }
  });

  gulp.task('changelog', ['bump'], function() {
    return gulp.src(config.changelogFile, {
      buffer: false
    })
      .pipe(conventionalChangelog({
        preset: config.conventionalChangelog
      }))
      .pipe(gulp.dest('./'));
  });

  gulp.task('createBranch', ['bump'], function(cb) {
    console.log('switch', config.releaseBranch + config.versionNumber);
    git.checkout(config.releaseBranch + config.versionNumber, {args: '-b'}, cb);
  });

  gulp.task('commit', ['bump', 'changelog', 'createBranch'], function() {
    var files = config.bumpFiles.concat(config.changelogFile);
    return gulp.src(files)
      .pipe(git.commit(config.commitMessage + config.versionNumber));
  });

  gulp.task('release', ['commit'], function(cb) {

    tagVersion()

    function tagVersion() {
      git.tag(config.tagPrefix + config.versionNumber, config.versionNumber, {}, switchBackToDevelop);
    }

    function switchBackToDevelop() {
      git.checkout(config.developBranch, {}, mergeInDevelop);
    }

    function mergeInDevelop() {
      git.merge(config.releaseBranch + config.versionNumber, {args: '--no-ff'}, checkoutMaster);
    }

    function checkoutMaster() {
      git.checkout(config.masterBranch, {}, mergeInMaster);
    }

    function mergeInMaster() {
      git.merge(config.releaseBranch + config.versionNumber, {args: '--no-ff'}, deleteBranch);
    }

    function deleteBranch() {
      git.branch(config.releaseBranch + config.versionNumber, {args: '-d'}, pushBranches);
    }

    function pushBranches() {
      if (config.push) {
        git.push(config.origin, config.developBranch + ' ' + config.masterBranch, {args: " --tags"}, checkoutDevelop);
      } else {
        cb();
      }
    }

    function checkoutDevelop() {
      git.checkout(config.developBranch, {}, cb);
    }
  });
};
