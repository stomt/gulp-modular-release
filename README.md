# gulp-modular-release [![npm version](https://badge.fury.io/js/gulp-modular-release.svg)](https://www.npmjs.com/package/gulp-modular-release) [![Dependency Status](https://gemnasium.com/ONE-LOGIC/gulp-modular-release.svg)](https://gemnasium.com/ONE-LOGIC/gulp-modular-release)

Modular extension to release projects using [git-flow](https://github.com/nvie/gitflow) release strategy. 

Works well alone or together with [gulp-modular](https://github.com/ONE-LOGIC/gulp-modular).

## Installation

```
npm install gulp-modular-release --save-dev
```

## Integration in gulpfile

```javascript
var gulp = require('gulp');
var gulpModularRelease = require('gulp-modular-release');

// optionally overwrite default configuration
var config = {

  //// task [`release`] creates a new release
  release: {
  //  versionNumber: argv.v, // the version number of the new release
  //  bumpFiles: ['./package.json', './bower.json'], // write version number to these files
  //  changelogFile: './CHANGELOG.md', // generate changelog in this file
  //  conventionalChangelog: 'angular', // choose preset style like: : 'angular', 'atom', 'eslint', 'jscs', 'jshint'
  //  commitMessage: 'bump version number ' + argv.v, // message of bump commit
  //  tagPrefix: '', // define a prefix like 'v' for the git tag
  //  masterBranch: 'master', // the projects master branch
  //  developBranch: 'develop', // the projects develop branch
  //  releaseBranch: 'release/' + argv.v // the release branch created while releasing
  //  push: false // push change to remote repository
  }
};
  
gulpModularRelease(gulp, config);
```

## Usage

```
gulp release -v 1.2.3

or

gulp release
```
(If no version is specified the next version is generated using [conventional-recommended-bump](https://github.com/stevemao/conventional-recommended-bump).)

## Strategy

1. creates branch `release/1.2.3` from `develop`
2. sets version number to `bower.json` and `package.json`
3. generates and writes changelog via conventional changelog to `CHANGELOG.md`
4. commits the previous changes
5. merges `release/1.2.3` into `develop`
6. merges `release/1.2.3` into `master` and tags it with `v1.2.3`
7. deletes branch `release/1.2.3`
8. (optionally) push changes to remote repository
