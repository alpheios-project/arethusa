// Code from https://github.com/Melindrea/grunt-githooks-example
"use strict";

var exec = require('child_process').exec;
var sh = require('execSync').run;
var branchName = require('execSync').exec('git branch | grep \'*\' | sed \'s/* //\'').stdout;

// Don't run on rebase
if (branchName !== '(no branch)') {
  exec('git diff --cached --quiet', function (err, stdout, stderr) {
    // only run if there are staged changes
    // i.e. what you would be committing if you ran "git commit" without "-a" option.
    if (err) {
      sh('git stash --keep-index --quiet');

      exec('grunt {{task}}', function (err, stdout, stderr) {
        console.log(stdout); // jshint ignore:line

        sh('git stash pop --quiet');

        var exitCode = 0;
        if (err) {
          console.log(stderr); // jshint ignore:line
          exitCode = -1;
        }

        process.exit(exitCode);
      });
    }
  });
}
