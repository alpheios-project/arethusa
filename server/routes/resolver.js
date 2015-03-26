'use strict';

var express = require('express'),
    router  = express.Router();

router.get('/:urn', resolveUrn);

function resolveUrn(req, res) {
  res.json({
    treebank: 'cat51.tb'
  });
}

module.exports = router;
