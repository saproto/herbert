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

router.get('/soundboard', function(req, res, next) {
  if(req.query.secret == process.env.SECRET) {
    ee.emit("soundboard", req.query.sound);
    res.send("OK");
  }else{
    res.status(403).send("NO. :(");
  }
});

router.get('/skip', function(req, res, next) {
    if(req.query.secret == process.env.SECRET) {
        ee.emit("skip");
        res.send("OK");
    }else{
        res.status(403).send("NO. :(");
    }
});

module.exports = router;
