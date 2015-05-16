'use strict';

/* global __dirname */

var express = require('express'),
    fs      = require('fs'),
    path    = require('path'),
    pd      = require('pretty-data').pd,
    mkdirp  = require('mkdirp'),
    paths   = require('../paths'),
    router  = express.Router();

var base = path.resolve(__dirname, '../../' + paths.examples);

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
    var p = docPath(req, addPath, ending);
    mkdirp(path.basename(p), function() {
      fs.writeFile(p, prettify(doc, req), function() { res.end(); });
    });
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
  'snapdrgn' : 'json',

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
  var p = docPath(req, 'comments', 'json');
  var now = new Date().toJSON();
  req.on('data', function(data) { comment  = JSON.parse(data); });
  req.on('end', function() {
    fs.readFile(p, function(err, file) {
      if (err) { comments = []; } else { comments = JSON.parse(file); }
      var ids = comments.map(function(el) { return el.comment_id; }).sort();
      delete comment.ids;
      delete comment.sentenceId;
      comment.comment_id = (ids[ids.length - 1] || 0) + 1;
      comment.reason = 'general';
      comment.user = 'you';
      comment.created_at = comment.updated_at = now;
      comments.push(comment);
      mkdirp(path.dirname(p), function(err) {
        fs.writeFile(p, prettify(comments, req), function() { res.json(comment); });
      });
    });
  });
});

module.exports = router;
