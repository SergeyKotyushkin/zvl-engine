var express = require('express');
var router = express.Router();

require('./indexRouter').init(router);
require('./authRouter').init(router);
require('./centerRouter').init(router);
require('./accountRouter').init(router);
require('./creatorRouter').init(router);
require('./gameRouter').init(router);

module.exports = router;
