// Code from https://github.com/Melindrea/grunt-githooks-example
"use strict";

var sh = require('execSync').run;

var shOutput = require('execSync').exec;
var file, command, fileChanged;

var object = require('../../hooks/data/update');
for (var i in object) {
    file = object[i].file;
    command = object[i].command;
    fileChanged = (shOutput('git diff HEAD@{1} --stat -- ' + file + ' | wc -l').stdout > 0);

    if (fileChanged) {
        console.log(file + ' has changed, dependencies will be updated.'); // jshint ignore:line
        sh(command);
    }
}
process.exit(0);
