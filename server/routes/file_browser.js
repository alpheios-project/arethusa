'use strict';

// heavily inspired by ...

/* global __dirname */

var express    = require('express'),
    fs         = require('fs'),
    path       = require('path'),
    bodyParser = require('body-parser'),
    mv         = require('mv'),
    paths      = require('../paths'),
    router  = express.Router();

var base = path.resolve(__dirname, '../../' + paths.examples);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

/* Serve the Tree */
router.get('/api/tree', function(req, res) {
  var _p;
  if (req.query.id == 1) {
    _p = base;
    processReq(_p, res);

  } else {
    if (req.query.id) {
      _p = req.query.id;
      processReq(_p, res);
    } else {
      res.json(['No valid data found']);
    }
  }
});

/* Serve a Resource */
router.get('/api/resource', function(req, res) {
  res.send(fs.readFileSync(req.query.resource, 'UTF-8'));
});

/* Stats of a Resource */
router.get('/api/stats', function(req, res) {
  fs.stat(req.query.resource, function(err, stats) {
    res.json(stats);
  });
});

/* Move a Resoruce */
router.post('/api/move', function(req, res) {
  var paths;
  req.on('data', function(data) { paths = JSON.parse(data); });
  req.on('end', function() {
    mv(paths.old, paths.new, function(err) {
      res.end();
    });
  });
});


function processReq(_p, res) {
  var files = [];
  var directories = [];
  fs.readdir(_p, function(err, list) {
    for (var i = list.length - 1; i >= 0; i--) {
      var el = processNode(_p, list[i]);
      var target = el.children ? directories : files;
      target.unshift(el);
    }
    res.json(directories.concat(files));
  });
}

function processNode(_p, f) {
  var s = fs.statSync(path.join(_p, f));
  console.log(path.join(_p, f));
  return {
    "id": path.join(_p, f),
    "text": f,
    "icon" : s.isDirectory() ? 'jstree-custom-folder' : 'jstree-custom-file',
    "state": {
      "opened": false,
      "disabled": false,
      "selected": false
    },
    "li_attr": {
      "base": path.join(_p, f),
      "isLeaf": !s.isDirectory()
    },
    "children": s.isDirectory()
  };
}

module.exports = router;
