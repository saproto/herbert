var express = require('express');
var router = express.Router();
var ee = require("../events");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/adminCheck', function(req, res, next) {
  ee.emit("adminCheck");
  res.send("OK");
});

module.exports = router;
