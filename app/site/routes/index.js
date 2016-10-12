var express = require('express');
var router = express.Router();

require('./indexRouter').init(router);

module.exports = router;
