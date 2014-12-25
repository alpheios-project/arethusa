'use strict';

/* global __dirname, console  */

var express = require('express'),
    morgan  = require('morgan'),
    path    = require('path'),
    app = express();

var examples = require('./routes/examples');
var base = path.resolve(__dirname + '/..');

app.use(morgan('dev'));
app.use(require('connect-livereload')({ port: 35279 }));

app.use('/examples', examples);
app.use(express.static(base));

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});


var port = process.env.NODE_PORT || 8081;

app.listen(port, function() {
  console.log('arethusa-server listening on port %d...', port);
});
