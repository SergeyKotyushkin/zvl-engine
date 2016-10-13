var express = require('express');
var router = express.Router();

require('./indexRouter').init(router);
require('./authRouter').init(router);
require('./centerRouter').init(router);

module.exports = router;
