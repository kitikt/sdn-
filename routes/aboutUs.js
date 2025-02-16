var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('aboutUs.ejs', { title: 'ccs Us' });
});

module.exports = router;
