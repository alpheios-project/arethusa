'use strict';

/* global __dirname, console  */

var express = require('express'),
    morgan  = require('morgan'),
    fs = require('fs');
var app = express();

function docPath(req, addPath, ending) {
  return __dirname + '/public/' + addPath + '/' + req.params.doc + '.' + ending;
}

var contentTypes = {
  'xml' : 'text/xml; charset=utf-8',
  'json' : 'application/json; charset=utf-8',
  'html': 'text/html; charset=utf-8'
};

function sendFile(req, res, addPath, ending) {
  res.header('Content-Type', contentTypes[ending]);
  res.sendFile(docPath(req, addPath, ending));
}

function writeFile(req, res, addPath, ending) {
  var doc = '';
  req.on('data', function(data) { doc += data; });
  req.on('end', function() {
    var path = docPath(req, addPath, ending);
    fs.writeFile(path, doc, function() { res.end(); });
  });
}

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

var exampleFileRoutes = {
  'treebanks': 'xml',
  'translations': 'json',
  'tei' : 'xml',
  'oa' : 'json',

  'treebanks/phaidra': 'json',
  'translations/phaidra': 'json'
};

function get(route, fileType) {
  return function(req, res) { sendFile(req, res, route, fileType); };
}

function post(route, fileType) {
  return function(req, res) { writeFile(req, res, route, fileType); };
}

app.use(morgan('dev'));
app.use(require('connect-livereload')({
  port: 35279
}));

for (var route in exampleFileRoutes) {
  var fileType = exampleFileRoutes[route];
  app.get( '/examples/' + route + '/:doc', get(route, fileType));
  app.post('/examples/' + route + '/:doc', post(route, fileType));
}

app.use(express.static(__dirname));

var port = process.env.NODE_PORT || 8081;
var server = app.listen(port, function() {
  console.log('arethusa-server listening on port %d...', server.address().port);
});
