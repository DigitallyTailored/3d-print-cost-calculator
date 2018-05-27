var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '3D Printing Cost Calculator' });

  console.log(req.query);
});



module.exports = router;
