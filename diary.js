var express = require('express');
var router = express.Router();

var app = require('app');

app.get('/timeline', function(req, res, next) {
  res.render('timeline');
});




module.exports = router;