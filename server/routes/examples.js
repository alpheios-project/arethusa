'use strict';

/* global __dirname */

var express = require('express'),
    fs      = require('fs'),
    path    = require('path'),
    router  = express.Router();

var base = path.resolve(__dirname, '../../examples/data');

function docPath(req, addPath, ending) {
  return base + '/' + addPath + '/' + req.params.doc + '.' + ending;
}

var contentTypes = {
  'xml' : 'text/xml; charset=utf-8',
  'json': 'application/json; charset=utf-8',
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

function get(route, fileType) {
  return function(req, res) { sendFile(req, res, route, fileType); };
}

function post(route, fileType) {
  return function(req, res) { writeFile(req, res, route, fileType); };
}

var exampleFileRoutes = {
  'treebanks': 'xml',
  'translations': 'json',
  'tei' : 'xml',
  'oa' : 'json',

  'treebanks/phaidra': 'json',
  'translations/phaidra': 'json'
};

for (var route in exampleFileRoutes) {
  var fileType = exampleFileRoutes[route];
  router.get( '/' + route + '/:doc', get(route, fileType));
  router.post('/' + route + '/:doc', post(route, fileType));
}

module.exports = router;
