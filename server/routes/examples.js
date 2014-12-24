'use strict';

/* global __dirname */

var express = require('express'),
    fs      = require('fs'),
    path    = require('path'),
    pd      = require('pretty-data').pd,
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

function prettify(str, req) {
  var type = req.headers['content-type'];
  if (type.match(/xml/))  return pd.xml(str);
  if (type.match(/json/)) return pd.json(str);
  return str;
}

function writeFile(req, res, addPath, ending) {
  var doc = '';
  req.on('data', function(data) { doc += data; });
  req.on('end', function() {
    var path = docPath(req, addPath, ending);
    fs.writeFile(path, prettify(doc, req), function() { res.end(); });
  });
}

function get(route, fileType) {
  return function(req, res) { sendFile(req, res, route, fileType); };
}

function post(route, fileType) {
  return function(req, res) { writeFile(req, res, route, fileType); };
}

function docRoute(route) {
  return '/' + route + '/:doc';
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
  router.get( docRoute(route), get(route, fileType));
  router.post(docRoute(route), post(route, fileType));
}

router.get( docRoute('comments'), get('comments', 'json'));
router.post(docRoute('comments'), function(req, res) {
  var comment, comments;
  var path = docPath(req, 'comments', 'json');
  var now = new Date().toJSON();
  req.on('data', function(data) { comment  = JSON.parse(data); });
  req.on('end', function() {
    fs.readFile(path, function(err, file) {
      if (err) { comments = []; } else { comments = JSON.parse(file); }
      var ids = comments.map(function(el) { return el.comment_id; }).sort();
      delete comment.ids;
      delete comment.sentenceId;
      comment.comment_id = (ids[ids.length - 1] || 0) + 1;
      comment.reason = 'general';
      comment.created_at = now;
      comment.updated_at = now;
      comment.user = 'you';
      comments.push(comment);
      fs.writeFile(path, prettify(comments, req), function() { res.json(comment); });
    });
  });
});

module.exports = router;
