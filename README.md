# gulp-modular-release
Modular extension to release projects using git-flow release strategy

## Installation

```
npm install gulp-modular-release
```

## Integration in gulpfile

```javascript
var gulp = require('gulp');
var gulpModularRelease = require('gulp-modular-release');

gulpModularRelease(gulp);
```

## Usage

```
gulp release -v 1.2.3
```

## Strategy

1. creates branch `release/1.2.3` from `develop`
2. sets version number to `bower.json` and `package.json`
3. generates and writes changelog via conventional changelog to `CHANGELOG.md`
4. commits the previous changes
5. merges `release/1.2.3` into `develop`
6. merges `release/1.2.3` into `master` and tags it with `v1.2.3`
7. deletes branch `release/1.2.3`
