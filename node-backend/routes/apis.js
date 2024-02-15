const express = require('express');
const fs = require('fs');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('apis', { title: 'Express' });
});

module.exports = router;
