
var logger = require("./logger.js")('mongodb');
var	mongoose = require('mongoose');

mongoose.connect(__env.MONGOCONNECTION);

var db = mongoose.connection;

db.on('error', function (err) {
	logger.error('Connection error:', err.message);
});

db.once('open', function () {
	logger.info("Connected to DB!");
});

var schema = mongoose.Schema;

module.exports = {
	mongo: mongoose,
	schema: schema
};
